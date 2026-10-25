# Pi agents in Mr. Mak

## Availability

Pi integration is included in this source checkout. The upstream v0.6.1 installer
predates it: build and install this checkout to get the Pi picker. Do not replace
a running installation until active chats are finished. Follow the source-build
and Update instructions in [Getting started](getting-started.md#build-from-source).

For now, you can also use the existing app: create a **PowerShell** chat, select
your project folder, then run `pi`. This is a generic terminal, so Mr. Mak does
not track the Pi session automatically; use `pi --continue` manually to resume.

## Set up a Pi chat

1. Install Pi if needed using its [official instructions](https://pi.dev).
   On Windows, the official installer uses `pi-node/current`; Mr. Mak also detects
   npm installations and commands on PATH. This computer already has Pi installed.
2. In the updated app, open **Chats → + → Pi**. Give the chat a task-specific name
   and choose its working folder. Optionally select Pi under **Settings → Chats →
   Default agent**.
3. Review Pi's project-trust prompt. Only trust project resources you recognize.
4. Run `/login` inside Pi and select a provider and authentication method offered
   there. Existing Pi credentials are reused; a login to another CLI is not
   automatically a Pi login. Subscription eligibility depends on the provider;
   API-key providers may bill separately. No Mr. Mak API key is required.
5. Run `/model` to select a model and `/thinking` to choose reasoning effort.
   These are Pi settings, not Codex/Claude effort controls in Mr. Mak.
6. Give Pi a task. For example: “Read AGENTS.md and the project instructions.
   Propose a short plan before editing. Run the relevant tests and summarize
   changed files.”

Pi reads the project's `AGENTS.md` and discovers `.agents/skills` (subject to
project trust). Keep project instructions and shared context in the repository.
Do not store credentials in those files; Pi authentication normally lives in
`~/.pi/agent/auth.json` outside the repository.

## Several agents

Create a separate Pi tab for each task (for example, implementation, review, and
research). Each tab has its own preallocated session ID, even in the same folder.
Use separate Git worktrees or project folders if agents will edit concurrently;
separate chat histories do not isolate files. Ask a reviewer to inspect changes
without editing if it shares the implementation folder.

Pi itself does not ship a built-in subagent/team orchestrator. Mr. Mak tabs are
independent CLI sessions, not an automatically coordinated team. Share handoff
notes in project files and explicitly tell the next agent what to read.

## History and limitations

- Close a Pi tab and reopen it from **History** to resume its exact session.
  The native Pi session files must still exist under the same Pi configuration
  and working folder. Mr. Mak saves terminal snapshots as well.
- To attach an existing conversation, copy the ID from Pi's `/session`, then use
  **New chat → Pi → Resume an existing CLI conversation**. Enter the ID, not a
  file path.
- Keep one native session per tab. Do not use `/new`, `/resume`, `/fork`, or
  `/clone` inside a managed Pi tab: the terminal integration does not observe
  session switches. Create a new tab or attach the new ID instead.
- This is terminal integration, not Pi RPC: structured conversation rendering,
  model inspection, native turn/completion notifications, and Pi MCP inspection
  in Mr. Mak are not implemented. Manage models and MCP inside Pi.
- Pi normally runs tools **without per-tool approval prompts**. Mr. Mak's bypass
  checkbox is hidden for Pi and no bypass/project-trust flags are injected.
  Project trust is not a sandbox. Pi can access files and commands allowed to
  your OS user; use a container or dedicated account for untrusted work.
