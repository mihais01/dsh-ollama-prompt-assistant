/**
 * dsh-ollama-prompt-assistant — browser half source.
 *
 * This is the readable source that `lib/client.js` is bundled from. It is kept
 * in sync by hand for this standalone plugin; a real build would use tsdown
 * (see the README). The bundle format is the DSH client module loader:
 * `window.__ModuleLoader__.load({ id, factory })`.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import type { InputActions, InputState } from '@deepseek-ai/dsh-client-ui-conversation/client';

/** The OLLAMA service. `ollama run ALIENTELLIGENCE/aipromptassistant` is the CLI over this HTTP endpoint. */
const OLLAMA_URL = 'http://localhost:11434/api/chat';
const OLLAMA_MODEL = 'ALIENTELLIGENCE/aipromptassistant';

/** One chat message in the multi-turn conversation. */
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/** Send a multi-turn conversation to the OLLAMA service and return the assistant reply. */
async function chatWithOllama(messages: ChatMessage[]): Promise<string> {
  const res = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: OLLAMA_MODEL, messages, stream: false }),
  });
  if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
  const data = (await res.json()) as { message?: { content?: string } };
  const output = (data.message?.content ?? '').trim();
  if (output === '') throw new Error('Ollama returned an empty response');
  return output;
}

interface OllamaPromptToggleProps {
  /** InputZone owner share: the live input state (draft text). */
  input: InputState;
  /** Standard session kit: the public draft write path. */
  inputActions: InputActions;
}

/**
 * The composer tool-row toggle (`conversation.input.right`).
 *
 * Clicking opens a small floating chat panel where the user refines the prompt
 * with the OLLAMA model in a multi-turn conversation. An "Accept" button pastes
 * the last assistant reply into the main input box.
 */
function OllamaPromptToggle({ input, inputActions }: OllamaPromptToggleProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatDraft, setChatDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const msgsRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll the message list to the latest message.
  useEffect(() => {
    if (open && msgsRef.current !== null) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [open, messages, busy]);

  // Dismiss the panel on a click outside it (and outside the toggle).
  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (panelRef.current !== null && target !== null && panelRef.current.contains(target)) return;
      if (buttonRef.current !== null && target !== null && buttonRef.current.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  const lastAssistant = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) if (messages[i].role === 'assistant') return messages[i];
    return null;
  }, [messages]);

  /** Send the current chat draft (and full history) to OLLAMA. */
  const send = async (text: string) => {
    const content = text.trim();
    if (content === '' || busy) return;
    const next: ChatMessage[] = [...messages, { role: 'user', content }];
    setMessages(next);
    setChatDraft('');
    setBusy(true);
    setError(null);
    try {
      const reply = await chatWithOllama(next);
      setMessages([...next, { role: 'assistant', content: reply }]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  };

  /** Open the panel, seeding the conversation with the composer draft. */
  const openPanel = () => {
    const seed = input.draft.trim();
    setMessages(seed === '' ? [] : [{ role: 'user', content: seed }]);
    setChatDraft('');
    setError(null);
    setOpen(true);
  };

  const closePanel = () => setOpen(false);

  /** Paste the last assistant reply into the main input box and close. */
  const accept = () => {
    if (lastAssistant !== null) {
      inputActions.setDraft(lastAssistant.content);
      setOpen(false);
    }
  };

  /** Reset the conversation but keep the panel open. */
  const clear = () => {
    setMessages([]);
    setError(null);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void send(chatDraft);
    }
  };

  return jsxs(Fragment, {
    children: [
      jsx('button', {
        ref: buttonRef,
        type: 'button',
        className: 'dshOpa_toggle',
        'data-active': open || undefined,
        onClick: open ? closePanel : openPanel,
        title: open ? 'Close the Ollama prompt assistant' : 'Open the Ollama prompt assistant to refine the prompt',
        'aria-pressed': open,
        children: open ? 'Ollama ▴' : 'Ollama',
      }),
      open &&
        jsxs('div', {
          ref: panelRef,
          className: 'dshOpa_panel',
          role: 'dialog',
          'aria-label': 'Ollama prompt assistant',
          children: [
            jsxs('div', {
              className: 'dshOpa_header',
              children: [
                jsx('span', { className: 'dshOpa_title', children: 'Ollama prompt assistant' }),
                jsx('button', {
                  type: 'button',
                  className: 'dshOpa_close',
                  'aria-label': 'Close',
                  onClick: closePanel,
                  children: '×',
                }),
              ],
            }),
            jsxs('div', {
              ref: msgsRef,
              className: 'dshOpa_msgs',
              children: [
                messages.length === 0 && !busy && jsx('p', {
                  className: 'dshOpa_empty',
                  children:
                    'Describe what you want the AI to do. Ollama will help you shape the prompt — when you are happy, press Accept.',
                }),
                ...messages.map((message, index) =>
                  jsx(
                    'div',
                    {
                      className: message.role === 'user' ? 'dshOpa_msg dshOpa_user' : 'dshOpa_msg dshOpa_asst',
                      children: message.content,
                    },
                    index,
                  ),
                ),
                busy &&
                  jsxs('span', {
                    className: 'dshOpa_thinking',
                    children: [jsx('span', { className: 'dshOpa_dot', 'aria-hidden': true }), 'Ollama is thinking…'],
                  }),
              ],
            }),
            error !== null && jsx('div', { className: 'dshOpa_error', role: 'alert', children: error }),
            jsxs('div', {
              className: 'dshOpa_inputRow',
              children: [
                jsx('textarea', {
                  className: 'dshOpa_input',
                  value: chatDraft,
                  onChange: (event) => setChatDraft(event.target.value),
                  onKeyDown,
                  rows: 1,
                  placeholder: 'Ask Ollama to refine the prompt…',
                  disabled: busy,
                }),
                jsx('button', {
                  type: 'button',
                  className: 'dshOpa_btn dshOpa_send',
                  onClick: () => void send(chatDraft),
                  disabled: busy || chatDraft.trim() === '',
                  children: 'Send',
                }),
              ],
            }),
            jsxs('div', {
              className: 'dshOpa_footer',
              children: [
                messages.length > 0 &&
                  jsx('button', {
                    type: 'button',
                    className: 'dshOpa_btn dshOpa_clear',
                    onClick: clear,
                    children: 'Clear',
                  }),
                jsx('button', {
                  type: 'button',
                  className: 'dshOpa_btn dshOpa_accept',
                  onClick: accept,
                  disabled: lastAssistant === null,
                  children: 'Accept',
                }),
              ],
            }),
          ],
        }),
    ],
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
        id: 'dsh-ollama-prompt-assistant',
      },
      OllamaPromptToggle,
    ),
  );
}