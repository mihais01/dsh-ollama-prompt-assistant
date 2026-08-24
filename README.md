# dsh-ollama-prompt-assistant

A **DeepSeek Harness (DSH) Web client plugin** that adds a toggle next to the
composer input box. When switched on, it sends the current input-box content to
the **OLLAMA** service (`ollama run ALIENTELLIGENCE/aipromptassistant`) and uses
the model's output as the prompt for the AI.

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

- Registers a small toggle into the composer's **right tool-row seat**
  (`conversation.input.right`), i.e. just left of the send button.
- On **toggle-on**, it reads the current draft, sends it to the OLLAMA service
  with the model `ALIENTELLIGENCE/aipromptassistant`, and **replaces the draft
  with the model's response** — so the AI then receives the OLLAMA output as
  its prompt.
- On **toggle-off** it simply turns the switch back off (the draft is kept).

This is useful when you want a local model to rewrite, expand, or clarify your
message before it is sent to the main assistant.

## How it works

The browser cannot spawn the `ollama run` CLI directly, so the plugin calls the
OLLAMA **HTTP API** that the CLI wraps:

```
POST http://localhost:11434/api/generate
Content-Type: application/json

{ "model": "ALIENTELLIGENCE/aipromptassistant", "prompt": "<draft>", "stream": false }
```

The response's `response` field becomes the new draft.

The plugin is a standard DSH **client plugin**:

- The **host (node) half** (`lib/index.js`) is an empty `apply` — it exists so
  the package appears as a cordis plugin entry in the host Loader.
- The **browser half** (`lib/client.js`) is a module-loader bundle that
  registers the toggle into the `conversation.input.right` slot. It reads the
  draft from the `input` owner share and writes the result through the
  `inputActions.setDraft(...)` standard session kit.

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

1. Type a message in the composer input box.
2. Click the **Ollama** toggle (just left of the send button).
3. The draft is sent to OLLAMA; when it returns, the draft is replaced with the
   model's output.
4. Send as usual — the AI now receives the OLLAMA output as its prompt.

The toggle shows `Ollama ✓` while active. If the input is empty or OLLAMA
errors, the reason appears as the button's tooltip.

## Configuration

The endpoint and model are constants at the top of `lib/client.js` (and
`src/client/index.tsx`):

| Constant       | Default                               | Purpose                          |
| -------------- | ------------------------------------- | -------------------------------- |
| `OLLAMA_URL`   | `http://localhost:11434/api/generate` | OLLAMA generate endpoint         |
| `OLLAMA_MODEL` | `ALIENTELLIGENCE/aipromptassistant`   | Model used to rewrite the prompt |

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
