import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { AGENTS, childEnvironment, terminalCommand } from '../agents.mjs';
import { resolveCommand } from '../platform.mjs';
import { Sessions } from '../sessions.mjs';

function argsOf(command) {
  if (process.platform !== 'win32') return command.args;
  return Buffer.from(command.args.at(-1), 'base64').toString('utf16le');
}

test('Pi is discoverable and uses exact IDs without approval bypass', async t => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'mrmak-pi-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const bin = process.platform === 'win32' ? path.join(root, 'pi-node', 'current') : path.join(root, '.local', 'bin');
  await mkdir(bin, { recursive: true });
  const executable = path.join(bin, process.platform === 'win32' ? 'pi.cmd' : 'pi');
  await writeFile(executable, '', { mode: 0o755 });
  assert.equal(resolveCommand('pi', { PATH: '', LOCALAPPDATA: root }, root), executable);
  assert.ok(AGENTS.some(agent => agent.id === 'pi' && agent.command === 'pi'));
  const old = process.env.PATH;
  process.env.PATH = bin;
  try {
    for (const options of [{ nativeId: 'chat-123' }, { resumeId: 'chat-123', bypass: true }]) {
      const args = argsOf(terminalCommand('pi', options));
      if (typeof args === 'string') {
        assert.match(args, /'--session-id' 'chat-123' '--tui-mode' 'regular'/);
        assert.doesNotMatch(args, /--continue|--approve|--yolo|--dangerously/);
      } else assert.deepEqual(args, ['--session-id', 'chat-123', '--tui-mode', 'regular']);
    }
    for (const resumeId of ['-evil', 'a:b', 'a.', '../file']) assert.throws(() => terminalCommand('pi', { resumeId }));
  } finally { if (old === undefined) delete process.env.PATH; else process.env.PATH = old; }
});

test('Pi tabs preallocate unique IDs and retain them through History restore', async t => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'mrmak-pi-sessions-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const sessions = new Sessions(root, root);
  // Exercise real metadata persistence and restore without spawning a paid CLI.
  sessions.launch = async () => {};
  sessions.nativeBoundary = async () => null;
  const a = await sessions.create({ agent: 'pi', cwd: root, bypass: true });
  assert.equal(a.bypass, false, 'Pi does not implement an approval-bypass mode');
  const b = await sessions.create({ agent: 'pi', cwd: root });
  assert.match(a.nativeId, /^[a-f0-9-]{36}$/);
  assert.notEqual(a.nativeId, b.nativeId);
  await sessions.remove(a.id);
  const restored = new Sessions(root, root);
  await restored.init();
  restored.launch = async (session, resumeId) => assert.equal(resumeId, a.nativeId);
  try {
    const resumed = await restored.resume(a.id);
    assert.equal(resumed.nativeId, a.nativeId);
    assert.equal(resumed.open, true);
  } finally {
    clearInterval(restored.timer);
    for (const manager of [sessions, restored]) for (const session of manager.items.values()) session.terminal?.dispose();
  }
});

test('Pi child terminals do not inherit the hosting session identity', () => {
  const names = ['PI_SESSION_FILE', 'PI_SESSION_ID', 'PI_MODEL', 'PI_PROVIDER', 'PI_REASONING_LEVEL', 'PI_CODING_AGENT_DIR'];
  const old = Object.fromEntries(names.map(name => [name, process.env[name]]));
  try {
    for (const name of names) process.env[name] = 'test-value';
    const env = childEnvironment();
    for (const name of names.slice(0, -1)) assert.equal(env[name], undefined);
    assert.equal(env.PI_CODING_AGENT_DIR, 'test-value', 'retain explicit global configuration');
  } finally {
    for (const name of names) if (old[name] === undefined) delete process.env[name]; else process.env[name] = old[name];
  }
});
