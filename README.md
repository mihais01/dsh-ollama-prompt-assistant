# dsh-ollama-prompt-assistant

A **DeepSeek Harness (DSH) Web client plugin** that adds an **Ollama** button
next to the composer input box. Clicking it opens a small in-browser chat panel
where you converse with the local **OLLAMA** model
(`ollama run ALIENTELLIGENCE/aipromptassistant`) to refine your prompt
back-and-forth until it says what you want — then **Accept** pastes the last
assistant reply into the main input box as the prompt for the AI.

![DSH Web plugin](https://img.shields.io/badge/DSH-Web%20plugin-4c1d95)
![license](https://img.shields.io/badge/license-MIT-green)

---

## Table of contents

- [What it does](#what-it-does)
- [How it works](#how-it-works)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Project layout](#project-layout)
- [Development](#development)
- [License](#license)

---

## What it does

- Adds an **Ollama** button to the composer's right tool-row
  (`conversation.input.right`), just left of the send button.
- Clicking it opens a **floating chat panel** inside the browser, seeded with
  the current composer draft as the first message (if any).
- You chat with the local OLLAMA model to shape the prompt — each turn sends the
  full conversation, so the model keeps context.
- When the prompt is right, press **Accept** — the last assistant reply is
  pasted into the main input box as the prompt for the AI. **Clear** resets the
  conversation; the **×** (or a click outside the panel) closes it.

This is useful when you want a local model to help you rewrite, expand, or
clarify your message before it is sent to the main assistant.

## How it works

The browser cannot spawn the `ollama run` CLI directly, so the plugin calls the
OLLAMA **HTTP API** that the CLI wraps — the multi-turn `/api/chat` endpoint:

```
POST http://localhost:11434/api/chat
Content-Type: application/json

{ "model": "ALIENTELLIGENCE/aipromptassistant", "messages": [{ "role": "user", "content": "…" }], "stream": false }
```

The response's `message.content` is appended to the conversation; the full
`messages` array is sent on every turn so the model keeps context. **Accept**
writes the last assistant `message.content` to the composer via the standard
`inputActions.setDraft(...)` session kit.

The plugin is a standard DSH **client plugin**:

- The **host (node) half** (`lib/index.js`) is an empty `apply` — it exists so
  the package appears as a cordis plugin entry in the host Loader.
- The **browser half** (`lib/client.js`) is a module-loader bundle that
  registers the button + chat panel into the `conversation.input.right` slot.

## Requirements

- A running **DSH Web** profile (`dsh --profile web`).
- A running **OLLAMA** service (default `http://localhost:11434`).
- The **`ALIENTELLIGENCE/aipromptassistant`** model pulled:

  ```sh
  ollama pull ALIENTELLIGENCE/aipromptassistant
  ```

## Installation

The package is a **DSH bundle** (declares `dsh.bundle`), so install it with the
standard `dsh plugin` command — there is no need to hand-edit `package.json` or
`cordis.patch.yml`.

### 1. Install the plugin


```sh
dsh plugin --profile web add https://github.com/mihais01/dsh-ollama-prompt-assistant.git -w
```


The `-w` flag makes pnpm add to the workspace root (the profile). `dsh plugin`
forwards to `pnpm add` inside the profile, then reconciles the package into the
profile's `bundles` list automatically because it declares `dsh.bundle`.

### 2. Restart the web profile

```sh
dsh web
```

That's it. The client-modules node half scans the loader for packages declaring
`dsh.client`, serves `/plugins/dsh-ollama-prompt-assistant/client.js`, and the
browser half registers the toggle. **A web-server restart is required** for the
plugin to be picked up (the client-plugin HMR path only auto-reloads when
`pnpm run dev:web` is running from a source checkout).

## Usage

1. Type a message (or leave it blank) in the composer input box.
2. Click the **Ollama** button (just left of the send button). A chat panel
   opens, seeded with your current draft as the first message.
3. Chat with the local model to refine the prompt — type a follow-up and press
   **Enter** (or **Send**). Use **Shift+Enter** for a newline. Each turn keeps
   the full conversation, so the model has context.
4. When the prompt is right, press **Accept** — the last assistant reply is
   pasted into the main input box.
5. Send as usual — the AI now receives the refined prompt.

**Panel controls:**
- **Accept** — paste the last assistant reply into the composer and close.
- **Clear** — reset the conversation (keep the panel open).
- **×** — close the panel (clicking outside the panel does **not** close it, so
  you can keep editing the composer while refining).

While the model is generating, the panel shows a `Ollama is thinking…` spinner
and the send button is disabled, so you always know when it's working.

## Configuration

The endpoint and model are constants at the top of `lib/client.js` (and
`src/client/index.tsx`):

| Constant       | Default                             | Purpose                          |
| -------------- | ----------------------------------- | -------------------------------- |
| `OLLAMA_URL`   | `http://localhost:11434/api/chat`   | OLLAMA chat endpoint              |
| `OLLAMA_MODEL` | `ALIENTELLIGENCE/aipromptassistant` | Model used to refine the prompt   |

Change them to point at a remote OLLAMA host or a different model.

## Project layout

```
dsh-ollama-prompt-assistant/
├── package.json          # dsh.bundle + dsh.client declarations + exports
├── cordis.patch.yml      # bundle patch: inserts the cordis row for this package
├── lib/
│   ├── index.js          # host (node) half — empty apply, makes it a cordis entry
│   └── client.js         # browser half — the built client bundle (module-loader format)
├── src/
│   └── client/
│       └── index.tsx     # readable source the bundle is kept in sync with
├── LICENSE
└── README.md
```

## Development

`lib/client.js` is the module-loader bundle. It is kept in sync with
`src/client/index.tsx` by hand for this standalone plugin. For a real build, use
`tsdown` (the same bundler the shipped DSH client plugins use):

```sh
pnpm add -D tsdown
tsdown
```

## License

[MIT](./LICENSE)
