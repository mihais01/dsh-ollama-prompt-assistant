/**
 * ollama-prompt-assistant — browser half source.
 *
 * This is the readable source that `lib/client.js` is bundled from. It is kept
 * in sync by hand for this standalone plugin; a real build would use tsdown
 * (see the README). The bundle format is the DSH client module loader:
 * `window.__ModuleLoader__.load({ id, factory })`.
 */
import { useState } from 'react';
import { jsx } from 'react/jsx-runtime';
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import type { InputActions, InputState } from '@deepseek-ai/dsh-client-ui-conversation/client';

/** The OLLAMA service. `ollama run ALIENTELLIGENCE/aipromptassistant` is the CLI over this HTTP endpoint. */
const OLLAMA_URL = 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = 'ALIENTELLIGENCE/aipromptassistant';

async function runOllama(prompt: string): Promise<string> {
  const res = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: OLLAMA_MODEL, prompt, stream: false }),
  });
  if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
  const data = (await res.json()) as { response?: string };
  const output = (data.response ?? '').trim();
  if (output === '') throw new Error('Ollama returned an empty response');
  return output;
}

interface OllamaPromptToggleProps {
  /** InputZone owner share: the live input state (draft text). */
  input: InputState;
  /** Standard session kit: the public draft write path. */
  inputActions: InputActions;
}

function OllamaPromptToggle({ input, inputActions }: OllamaPromptToggleProps) {
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = async () => {
    if (enabled) {
      setEnabled(false);
      return;
    }
    const draft = input.draft;
    if (draft.trim() === '') {
      setError('Input is empty');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const output = await runOllama(draft);
      inputActions.setDraft(output);
      setEnabled(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  };

  const label = busy ? '…' : enabled ? 'Ollama ✓' : 'Ollama';
  return jsx('button', {
    type: 'button',
    onClick: toggle,
    disabled: busy,
    title: error ?? 'Send the draft to Ollama and use its output as the prompt',
    'aria-pressed': enabled,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      height: '24px',
      padding: '0 8px',
      border: '1px solid var(--dsw-alias-border-l2, #d0d0d0)',
      borderRadius: '6px',
      background: enabled ? 'var(--dsw-alias-state-success-primary, #2f9e44)' : 'transparent',
      color: enabled ? '#fff' : 'var(--dsw-alias-label-secondary, #555)',
      fontSize: '12px',
      lineHeight: '24px',
      cursor: busy ? 'wait' : 'pointer',
      opacity: busy ? 0.6 : 1,
    },
    children: label,
  });
}

/** Required cordis services: only the slot registry. */
export const inject = ['slots'];

/** Client plugin body: register the toggle into the composer's right tool-row seat. */
export function apply(ctx: ClientContext): void {
  ctx.slots.inject('conversation.input.right', () =>
    ctx.slots.register(
      {
        name: 'conversation.input.right',
        id: 'ollama-prompt-assistant',
      },
      OllamaPromptToggle,
    ),
  );
}
