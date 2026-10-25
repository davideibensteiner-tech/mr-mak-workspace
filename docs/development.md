# Local desktop development

## Development repository

Mr. Mak tooling is developed in this checkout and published to
[the development fork](https://github.com/davideibensteiner-tech/mr-mak-workspace).
Use `origin` for this fork and `upstream` for the original
`witnesstodark/mr-mak-workspace` repository. Push local development changes to
`origin`; upstream releases are references, not replacements for this checkout.

## Machine setup

This Windows checkout is `I:\Repositories\mr-mak-workspace`. Node.js, npm,
Visual Studio C++ tools, WebView2, Pi, and stable Rust's MSVC toolchain are
installed. Open a new PowerShell after installing Rust so Cargo is on PATH.
Dependencies are installed with `npm ci` (including the desktop service).

```powershell
cd I:\Repositories\mr-mak-workspace
.\Setup.ps1 -Mode Check
```

If an older shell cannot find Cargo for this session:

```powershell
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"
```

## Fast iteration with the native windows

1. Finish active tasks and choose **Quit** in the installed app's tray menu.
   Closing just a window can leave the app running. Development and production
   use the same application identity and repository state: do not run both at once.
2. From the checkout run:

   ```powershell
   npm run desktop:dev -- -- -- --repo I:\Repositories\mr-mak-workspace
   ```

   This builds the frontend and runs a debug Tauri shell. Debug builds explicitly
   use `desktop/service` and `dist` from the checkout, not the staged release
   runtime. The first native debug compile takes longer; subsequent ones cache.
3. In a second terminal, run `npm run build:watch` for UI changes. After a build,
   refresh the affected desktop window (Ctrl+R). This is a watched production UI
   build, not Vite hot-module replacement. Run `npm run build` for TypeScript checks.
4. Service edits require quitting/relaunching the development app. Rust edits are
   watched by `tauri dev` and can restart it, so finish active agent work first.
5. Keep personal state and credentials out of Git. `.mrmak` contains local state;
   native Pi conversations normally live under `~/.pi/agent/sessions`.

For isolated experiments, pass another complete repository with
`workspace/workspace.json` as `--repo`; its local state stays separate.

## Checks before shipping

```powershell
npm run build
npm run lint
npm test
npm run test:template
npm run desktop:test:ui
```

UI tests use Edge on Windows and isolated fixture repositories and terminals;
no provider login or paid generation is required. Pi is covered by terminal
scroll/copy UI fixtures and dedicated command, environment and restore tests.

## Install the latest source version

Run this from an external PowerShell, not from a managed Mr. Mak chat:

```powershell
.\Setup.ps1 -Mode Update
```

It installs dependencies, prepares the bundled Node/service/UI, builds the native
installer, waits for you to quit the old app and its service, then installs and
reopens this repository. It never forcibly terminates active chats. For a build
without installation, use `npm run desktop:build` or `Setup.ps1 -Mode Desktop`.

Installers are under `src-tauri/target/release/bundle/nsis/`. Local builds still
report the upstream version 0.6.1; the version number alone does not distinguish
this Pi-enabled checkout from the upstream installer. Do not overwrite these
changes with an upstream release when testing local improvements.

See [Pi agent setup](pi.md) for login, model selection, independent agent tabs,
and current integration limitations. Pi needs its own supported provider login;
no credentials or paid model calls are provisioned by the development setup.
