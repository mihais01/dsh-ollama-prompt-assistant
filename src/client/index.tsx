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

/**
 * Instruction prepended to every user turn sent to the model. The
 * aipromptassistant model has a baked-in verbose format and ignores the
 * `system` field, so the reliable lever is the user message: it forces a
 * single, parseable <PROMPT>…</PROMPT> block and forbids invented
 * frameworks/languages and follow-up questions. The displayed conversation
 * keeps the user's raw text; this prefix is added only on the wire.
 */
const REFINE_PREFIX =
  'Refine the prompt that follows to make it clearer and more actionable. Do not invent or hallucinate frameworks, programming languages, libraries, tools, or any specifics not mentioned — keep it technology-agnostic if none are named. Do not add context, preamble, questions, or explanation. Output ONLY the refined prompt wrapped between <PROMPT> and </PROMPT> tags, nothing else.\n\nPrompt to refine:\n';

/** Panel size constraints and defaults. */
const MIN_W = 300;
const MIN_H = 240;
const DEF_W = 440;
const DEF_H = 440;

/** One chat message in the multi-turn conversation. */
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/** Send a multi-turn conversation to the OLLAMA service and return the assistant reply. */
async function chatWithOllama(messages: ChatMessage[]): Promise<string> {
  const wire: ChatMessage[] = messages.map((message) =>
    message.role === 'user' ? { role: 'user', content: REFINE_PREFIX + message.content } : message,
  );
  const res = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: OLLAMA_MODEL, messages: wire, stream: false }),
  });
  if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
  const data = (await res.json()) as { message?: { content?: string } };
  const output = (data.message?.content ?? '').trim();
  if (output === '') throw new Error('Ollama returned an empty response');
  return output;
}

/**
 * Pull just the optimized prompt out of a model reply. We instruct the model
 * to wrap the refined prompt in <PROMPT>…</PROMPT>, so that marker is the
 * primary signal (reliable across the model's baked-in verbose format).
 * Fallbacks: a quoted span, then leading-label / trailing-chatter stripping.
 */
function extractPrompt(text: string): string {
  const raw = text.trim();
  // 1. Prefer the <PROMPT>…</PROMPT> marker (what we instruct).
  const marked = /<PROMPT>\s*([\s\S]*?)\s*<\/PROMPT>/i.exec(raw);
  if (marked !== null) return marked[1].trim();
  // 2. First quoted span (straight "…" or smart "…").
  const quoted = /"([^"]+)"|\u201c([^\u201d]+)\u201d/.exec(raw);
  if (quoted !== null) {
    return (quoted[1] ?? quoted[2]).trim().replace(/^\*+|\*+$/g, '').trim();
  }
  // 3. Fallback: drop leading label lines (e.g. "Here is an improved prompt:", "**Improved Prompt:**").
  const lines = raw.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (line === '' || !/^\*{0,2}[^:]{0,70}:\*{0,2}$/.test(line)) break;
    i++;
  }
  // 4. Take content until a blank line or a trailing follow-up section.
  const out: string[] = [];
  for (; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed === '') break;
    if (/^(here are|here's|questions?|please let me know|let me know|\d+[.)])/i.test(trimmed)) break;
    out.push(line);
  }
  return out.join('\n').trim().replace(/^\*+|\*+$/g, '').trim();
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
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const [size, setSize] = useState<{ width: number; height: number }>({ width: DEF_W, height: DEF_H });
  const [drag, setDrag] = useState<{ startX: number; startY: number; startLeft: number; startTop: number } | null>(null);
  const [resize, setResize] = useState<{ startX: number; startY: number; startW: number; startH: number } | null>(null);
  const msgsRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll the message list to the latest message.
  useEffect(() => {
    if (open && msgsRef.current !== null) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [open, messages, busy]);

  // Move the panel while dragging (clamped to the viewport).
  useEffect(() => {
    if (drag === null) return;
    const onMove = (event: PointerEvent) => {
      const left = Math.min(Math.max(0, drag.startLeft + event.clientX - drag.startX), window.innerWidth - size.width);
      const top = Math.min(Math.max(0, drag.startTop + event.clientY - drag.startY), window.innerHeight - 40);
      setPos({ left, top });
    };
    const onUp = () => setDrag(null);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [drag, size.width, size.height]);

  // Resize the panel from its bottom-right corner (clamped to the viewport).
  useEffect(() => {
    if (resize === null) return;
    const onMove = (event: PointerEvent) => {
      const width = Math.min(Math.max(MIN_W, resize.startW + event.clientX - resize.startX), window.innerWidth - (pos?.left ?? 0) - 8);
      const height = Math.min(Math.max(MIN_H, resize.startH + event.clientY - resize.startY), window.innerHeight - (pos?.top ?? 0) - 8);
      setSize({ width, height });
    };
    const onUp = () => setResize(null);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [resize, pos]);

  /** Begin dragging the panel by its header. */
  const onHeaderPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || pos === null) return;
    event.preventDefault();
    setDrag({ startX: event.clientX, startY: event.clientY, startLeft: pos.left, startTop: pos.top });
  };

  /** Begin resizing the panel from its bottom-right corner. */
  const onResizePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    setResize({ startX: event.clientX, startY: event.clientY, startW: size.width, startH: size.height });
  };

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
    if (pos === null) {
      const w = Math.min(DEF_W, window.innerWidth - 32);
      const h = Math.min(DEF_H, window.innerHeight - 90);
      setSize({ width: w, height: h });
      setPos({ left: Math.max(8, window.innerWidth - w - 20), top: Math.max(8, window.innerHeight - h - 72) });
    }
    setOpen(true);
  };

  const closePanel = () => setOpen(false);

  /** Paste the optimized prompt (preamble stripped) into the main input box and close. */
  const accept = () => {
    if (lastAssistant !== null) {
      const prompt = extractPrompt(lastAssistant.content);
      // Fall back to the raw reply so Accept always inserts something
      // (and surfaces the write path if extraction ever misses).
      inputActions.setDraft(prompt !== '' ? prompt : lastAssistant.content);
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
          style: pos === null ? undefined : { left: pos.left, top: pos.top, width: size.width, height: size.height },
          children: [
            jsxs('div', {
              className: 'dshOpa_header',
              onPointerDown: onHeaderPointerDown,
              children: [
                jsx('span', { className: 'dshOpa_title', children: 'Ollama prompt assistant' }),
                jsx('button', {
                  type: 'button',
                  className: 'dshOpa_close',
                  'aria-label': 'Close',
                  onClick: closePanel,
                  onPointerDown: (event) => event.stopPropagation(),
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
            jsx('div', { className: 'dshOpa_resize', onPointerDown: onResizePointerDown, 'aria-hidden': true }),
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