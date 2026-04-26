# dispatch-codex

A small Telegram remote-control bridge for local Codex sessions.

The goal is simple: keep Codex running on your own computer, then use your phone to pick up an existing Codex thread, continue the conversation, see output, approve actions, and stop a running turn when needed.

This project is intentionally focused on Codex. It talks to the local `codex app-server`; Telegram is only the mobile control surface.

## What this is for

You are working with Codex on your computer. Later, from your phone, you want to open Telegram, choose the thread you were working on, send normal natural-language follow-ups, and approve permission requests without opening a terminal or remote desktop.

The main command is:

```text
/resume
```

`/resume` shows recent Codex threads. Tap a thread, and that Telegram chat/topic is bound to it. After that, plain text continues the selected thread.

## Requirements

Node.js 24+ / authenticated `codex` CLI / Telegram bot token / your numeric Telegram user ID.

The Codex CLI must work under the same OS user that runs this bridge. Run this first on the target computer:

```bash
codex --version
codex app-server --help
```

## Quick start

```bash
git clone https://github.com/Liyue2341/dispatch-codex.git
cd dispatch-codex
npm install
cp .env.example .env.codex
```

Edit `.env.codex`:

```dotenv
BRIDGE_ENGINE=codex
BRIDGE_INSTANCE_ID=dispatch-codex
TG_BOT_TOKEN=your_telegram_bot_token
TG_ALLOWED_USER_ID=your_numeric_telegram_user_id
DEFAULT_CWD=/absolute/path/to/workspace
CODEX_CLI_BIN=codex
DEFAULT_APPROVAL_POLICY=on-request
DEFAULT_SANDBOX_MODE=workspace-write
CODEX_APP_SYNC_ON_OPEN=true
```

Then build, check, and run in the foreground:

```bash
ENV_FILE=.env.codex npm run build
ENV_FILE=.env.codex npm run doctor
ENV_FILE=.env.codex npm run serve
```

Open Telegram and send:

```text
/resume
```

## Core commands

`/resume` shows recent Codex threads and lets you bind one. `/resume keyword` searches threads. `/resume 3` opens the third cached thread from the latest list. `/resume new` starts a new thread.

`/where` shows the current bound thread. `/interrupt` stops the active turn. `/permissions` opens access settings. `/status` shows bridge/runtime status. `/reconnect` refreshes the Codex app-server session.

Most of the time, after `/resume`, you should just type normally.

## Approval flow

Keep the default safe-but-usable settings first:

```dotenv
DEFAULT_APPROVAL_POLICY=on-request
DEFAULT_SANDBOX_MODE=workspace-write
```

When Codex asks for permission, Telegram shows buttons such as Allow, Allow Session, Deny, and Details. This is the important mobile-control path; you do not need to use complex slash commands for normal work.

## Telegram setup notes

For private use, `TG_ALLOWED_USER_ID` is the main security boundary. Only that Telegram user can control the bot.

For group/topic use, also set:

```dotenv
TG_ALLOWED_CHAT_ID=-100xxxxxxxxxx
TG_ALLOWED_TOPIC_ID=123
```

If messages do not arrive, make sure no webhook is configured for the same bot and no other process is polling the same bot token. `npm run doctor` is intended to catch the common setup problems.

## Local desktop vs VPS

On your own desktop/laptop, `CODEX_APP_SYNC_ON_OPEN=true` is useful because selecting a thread can sync/reveal it in the local Codex host.

On a headless VPS, set it to false:

```dotenv
CODEX_APP_SYNC_ON_OPEN=false
```

The bridge still works; it just avoids trying to open/reveal a local desktop Codex UI.

## Attachments

Telegram attachments are saved under the selected thread workspace, inside `.telegram-inbox/`. This is intentional: Codex needs a local path to inspect the file.

Example: if the current thread cwd is `/Users/me/project-a`, an uploaded image may be saved under:

```text
/Users/me/project-a/.telegram-inbox/2026-04-26/<thread-id>/...
```

If you switch to a thread whose cwd is `/Users/me/project-b`, later uploads go into project B instead. `.telegram-inbox/` is gitignored by this repository, but you should also avoid committing it in your own projects.

## Service mode

After foreground mode works, install it as a user service:

```bash
ENV_FILE=.env.codex ./scripts/service/install.sh
ENV_FILE=.env.codex ./scripts/service/status.sh
ENV_FILE=.env.codex ./scripts/service/logs.sh
```

Foreground mode is better for the first run; service mode is better once the setup is stable.

## Smoke test

Start the bridge, then in Telegram try `/status`, `/resume`, select a thread, send a simple natural-language message, trigger a harmless file read or command approval, and try `/interrupt` during a longer run.

If those work, the core mobile handoff path is working.
