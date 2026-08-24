window.__ModuleLoader__.load({
	id: "dsh-ollama-prompt-assistant",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");

		// Inject styles once (guarded, module-loader style).
		const CSS_ID = "dsh-ollama-prompt-assistant/styles";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(CSS_ID) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-ollama-prompt-assistant";
			tag.dataset.pluginCss = CSS_ID;
			tag.textContent = [
				"@keyframes dsh-ollama-spin{to{transform:rotate(360deg)}}",
				".dshOpa_panel{position:fixed;z-index:60;display:flex;flex-direction:column;border:1px solid var(--dsw-alias-border-inverted,#1f1f1f);background:var(--dsw-specific-menu,#fff);color:var(--dsw-alias-label-primary,#1f1f1f);border-radius:12px;box-shadow:var(--dsw-shadow-lv3,0 8px 30px rgba(0,0,0,.18));overflow:hidden}",
				".dshOpa_header{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 12px;border-bottom:1px solid var(--dsw-alias-border-l2,#e4e4e4);cursor:move;user-select:none;touch-action:none}",
				".dshOpa_title{font-size:13px;font-weight:600;line-height:20px}",
				".dshOpa_close{width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;border:none;border-radius:6px;background:transparent;color:inherit;cursor:pointer;font-size:16px;line-height:1}",
				".dshOpa_close:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.06))}",
				".dshOpa_msgs{flex:1;min-height:120px;overflow-y:auto;padding:10px 12px;display:flex;flex-direction:column;gap:8px}",
				".dshOpa_msg{max-width:84%;padding:7px 10px;border-radius:10px;font-size:13px;line-height:18px;white-space:pre-wrap;word-break:break-word}",
				".dshOpa_user{align-self:flex-end;background:var(--dsw-alias-state-business-primary,#4c1d95);color:#fff;border-bottom-right-radius:3px}",
				".dshOpa_asst{align-self:flex-start;background:var(--dsw-alias-button-ghost-active-fill,rgba(0,0,0,.05));border:1px solid var(--dsw-alias-border-l2,#e4e4e4);border-bottom-left-radius:3px}",
				".dshOpa_thinking{align-self:flex-start;color:var(--dsw-alias-label-tertiary,#888);font-size:12px;display:inline-flex;align-items:center;gap:6px}",
				".dshOpa_dot{display:inline-block;width:9px;height:9px;border:2px solid var(--dsw-alias-label-tertiary,#888);border-top-color:transparent;border-radius:50%;animation:dsh-ollama-spin .7s linear infinite}",
				".dshOpa_empty{color:var(--dsw-alias-label-tertiary,#888);font-size:12px;text-align:center;margin:auto 0}",
				".dshOpa_error{color:var(--dsw-alias-state-error-primary,#e03131);font-size:12px;padding:6px 12px;border-top:1px solid var(--dsw-alias-border-l2,#e4e4e4)}",
				".dshOpa_inputRow{display:flex;gap:6px;padding:8px 10px;border-top:1px solid var(--dsw-alias-border-l2,#e4e4e4)}",
				".dshOpa_input{flex:1;min-width:0;resize:none;max-height:96px;border:1px solid var(--dsw-alias-border-l2,#d0d0d0);border-radius:8px;padding:6px 8px;font:inherit;font-size:13px;line-height:18px;background:var(--dsw-alias-bg-base,#fff);color:inherit}",
				".dshOpa_input:focus{outline:none;border-color:var(--dsw-alias-state-business-primary,#4c1d95)}",
				".dshOpa_btn{height:30px;padding:0 12px;border:none;border-radius:8px;font:inherit;font-size:13px;font-weight:500;cursor:pointer}",
				".dshOpa_send{background:var(--dsw-alias-state-business-primary,#4c1d95);color:#fff}",
				".dshOpa_send:disabled{opacity:.5;cursor:default}",
				".dshOpa_footer{display:flex;justify-content:flex-end;gap:8px;padding:8px 10px;border-top:1px solid var(--dsw-alias-border-l2,#e4e4e4)}",
				".dshOpa_accept{background:var(--dsw-alias-state-success-primary,#2f9e44);color:#fff}",
				".dshOpa_accept:disabled{opacity:.5;cursor:default}",
				".dshOpa_clear{background:transparent;color:var(--dsw-alias-label-secondary,#555);border:1px solid var(--dsw-alias-border-l2,#d0d0d0)}",
				".dshOpa_toggle{display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 8px;border:1px solid var(--dsw-alias-border-l2,#d0d0d0);border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary,#555);font-size:12px;line-height:24px;cursor:pointer;transition:background 150ms ease,border-color 150ms ease}",
				".dshOpa_toggle:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05))}",
				".dshOpa_toggle[data-active]{background:var(--dsw-alias-state-business-primary,#4c1d95);color:#fff;border-color:transparent}",
				".dshOpa_resize{position:absolute;right:0;bottom:0;width:16px;height:16px;cursor:nwse-resize;touch-action:none;z-index:1}",
				".dshOpa_resize::after{content:\"\";position:absolute;right:3px;bottom:3px;width:8px;height:8px;border-right:2px solid var(--dsw-alias-label-tertiary,#888);border-bottom:2px solid var(--dsw-alias-label-tertiary,#888)}"
			].join("\n");
			document.head.appendChild(tag);
		}

		// The OLLAMA service. `ollama run ALIENTELLIGENCE/aipromptassistant`
		// with a prompt is the CLI wrapper over the HTTP chat endpoint we call
		// here (the browser cannot spawn the CLI directly).
		const OLLAMA_URL = "http://localhost:11434/api/chat";
		const OLLAMA_MODEL = "ALIENTELLIGENCE/aipromptassistant";

		// Instruction prepended to every user turn sent to the model. The
		// aipromptassistant model has a baked-in verbose format and ignores the
		// `system` field, so the reliable lever is the user message: it forces a
		// single, parseable <PROMPT>…</PROMPT> block and forbids invented
		// frameworks/languages and follow-up questions. The displayed
		// conversation keeps the user's raw text; this prefix is added only on
		// the wire.
		const REFINE_PREFIX = "Refine the prompt that follows to make it clearer and more actionable. Do not invent or hallucinate frameworks, programming languages, libraries, tools, or any specifics not mentioned — keep it technology-agnostic if none are named. Do not add context, preamble, questions, or explanation. Output ONLY the refined prompt wrapped between <PROMPT> and </PROMPT> tags, nothing else.\n\nPrompt to refine:\n";

		/**
		 * Send a multi-turn conversation to the OLLAMA service and return the
		 * assistant's reply text. The displayed `messages` stay clean; the
		 * refine instruction is prepended to each user turn on the wire.
		 * @param messages - the full conversation ({role, content}[]) so far.
		 * @returns the assistant's response text (trimmed).
		 */
		async function chatWithOllama(messages) {
			const wire = messages.map((message) => message.role === "user"
				? { role: "user", content: REFINE_PREFIX + message.content }
				: message);
			const res = await fetch(OLLAMA_URL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ model: OLLAMA_MODEL, messages: wire, stream: false })
			});
			if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
			const data = await res.json();
			const output = (data.message?.content ?? "").trim();
			if (output === "") throw new Error("Ollama returned an empty response");
			return output;
		}

		/**
		 * Pull just the optimized prompt out of a model reply. We instruct the
		 * model to wrap the refined prompt in <PROMPT>…</PROMPT>, so that marker is
		 * the primary signal (reliable across the model's baked-in verbose
		 * format). Fallbacks: a quoted span, then leading-label / trailing-chatter
		 * stripping.
		 * @param text - the raw assistant reply.
		 * @returns the prompt text to paste into the composer.
		 */
		function extractPrompt(text) {
			const raw = text.trim();
			// 1. Prefer the <PROMPT>…</PROMPT> marker (what we instruct).
			const marked = /<PROMPT>\s*([\s\S]*?)\s*<\/PROMPT>/i.exec(raw);
			if (marked !== null) return marked[1].trim();
			// 2. First quoted span (straight "…" or smart "…").
			const quoted = /"([^"]+)"|\u201c([^\u201d]+)\u201d/.exec(raw);
			if (quoted !== null) {
				return (quoted[1] ?? quoted[2]).trim().replace(/^\*+|\*+$/g, "").trim();
			}
			// 3. Fallback: drop leading label lines (e.g. "Here is an improved prompt:", "**Improved Prompt:**").
			const lines = raw.split(/\r?\n/);
			let i = 0;
			while (i < lines.length) {
				const line = lines[i].trim();
				if (line === "" || !/^\*{0,2}[^:]{0,70}:\*{0,2}$/.test(line)) break;
				i++;
			}
			// 4. Take content until a blank line or a trailing follow-up section.
			const out = [];
			for (; i < lines.length; i++) {
				const line = lines[i];
				const trimmed = line.trim();
				if (trimmed === "") break;
				if (/^(here are|here's|questions?|please let me know|let me know|\d+[.)])/i.test(trimmed)) break;
				out.push(line);
			}
			return out.join("\n").trim().replace(/^\*+|\*+$/g, "").trim();
		}

		const MIN_W = 300, MIN_H = 240;
		const DEF_W = 440, DEF_H = 440;

		/**
		 * The composer tool-row toggle (`conversation.input.right`).
		 *
		 * Clicking opens a small floating chat panel where the user refines the
		 * prompt with the OLLAMA model in a multi-turn conversation. An "Accept"
		 * button pastes the last assistant reply into the main input box. The
		 * panel is draggable by its header and resizable from its bottom-right
		 * corner.
		 *
		 * Props come from the framework: `input` (InputZone owner share) and
		 * `inputActions` (the standard session kit's public draft write path).
		 */
		function OllamaPromptToggle({ input, inputActions }) {
			const [open, setOpen] = react.useState(false);
			const [messages, setMessages] = react.useState([]);
			const [chatDraft, setChatDraft] = react.useState("");
			const [busy, setBusy] = react.useState(false);
			const [error, setError] = react.useState(null);
			const [pos, setPos] = react.useState(null);
			const [size, setSize] = react.useState({ width: DEF_W, height: DEF_H });
			const [drag, setDrag] = react.useState(null);
			const [resize, setResize] = react.useState(null);
			const msgsRef = react.useRef(null);
			const panelRef = react.useRef(null);
			const buttonRef = react.useRef(null);

			// Auto-scroll the message list to the latest message.
			react.useEffect(() => {
				if (open && msgsRef.current !== null) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
			}, [open, messages, busy]);

			// Move the panel while dragging (clamped to the viewport).
			react.useEffect(() => {
				if (drag === null) return;
				const onMove = (event) => {
					const w = size.width;
					const h = size.height;
					const left = Math.min(Math.max(0, drag.startLeft + event.clientX - drag.startX), window.innerWidth - w);
					const top = Math.min(Math.max(0, drag.startTop + event.clientY - drag.startY), window.innerHeight - 40);
					setPos({ left, top });
				};
				const onUp = () => setDrag(null);
				window.addEventListener("pointermove", onMove);
				window.addEventListener("pointerup", onUp);
				return () => {
					window.removeEventListener("pointermove", onMove);
					window.removeEventListener("pointerup", onUp);
				};
			}, [drag, size.width, size.height]);

			// Resize the panel from its bottom-right corner (clamped to the viewport).
			react.useEffect(() => {
				if (resize === null) return;
				const onMove = (event) => {
					const width = Math.min(Math.max(MIN_W, resize.startW + event.clientX - resize.startX), window.innerWidth - (pos?.left ?? 0) - 8);
					const height = Math.min(Math.max(MIN_H, resize.startH + event.clientY - resize.startY), window.innerHeight - (pos?.top ?? 0) - 8);
					setSize({ width, height });
				};
				const onUp = () => setResize(null);
				window.addEventListener("pointermove", onMove);
				window.addEventListener("pointerup", onUp);
				return () => {
					window.removeEventListener("pointermove", onMove);
					window.removeEventListener("pointerup", onUp);
				};
			}, [resize, pos]);

			/** Begin dragging the panel by its header. */
			const onHeaderPointerDown = (event) => {
				if (event.button !== 0 || pos === null) return;
				event.preventDefault();
				setDrag({ startX: event.clientX, startY: event.clientY, startLeft: pos.left, startTop: pos.top });
			};

			/** Begin resizing the panel from its bottom-right corner. */
			const onResizePointerDown = (event) => {
				if (event.button !== 0) return;
				event.preventDefault();
				event.stopPropagation();
				setResize({ startX: event.clientX, startY: event.clientY, startW: size.width, startH: size.height });
			};

			const lastAssistant = react.useMemo(() => {
				for (let i = messages.length - 1; i >= 0; i--) if (messages[i].role === "assistant") return messages[i];
				return null;
			}, [messages]);

			/** Send the current chat draft (and full history) to OLLAMA. */
			const send = async (text) => {
				const content = text.trim();
				if (content === "" || busy) return;
				const next = [...messages, { role: "user", content }];
				setMessages(next);
				setChatDraft("");
				setBusy(true);
				setError(null);
				try {
					const reply = await chatWithOllama(next);
					setMessages([...next, { role: "assistant", content: reply }]);
				} catch (cause) {
					setError(cause instanceof Error ? cause.message : String(cause));
				} finally {
					setBusy(false);
				}
			};

			/** Open the panel, seeding the conversation with the composer draft. */
			const openPanel = () => {
				const seed = (input?.draft ?? "").trim();
				setMessages(seed === "" ? [] : [{ role: "user", content: seed }]);
				setChatDraft("");
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
					inputActions?.setDraft(prompt !== "" ? prompt : lastAssistant.content);
					setOpen(false);
				}
			};

			/** Reset the conversation but keep the panel open. */
			const clear = () => {
				setMessages([]);
				setError(null);
			};

			const onKeyDown = (event) => {
				if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
					event.preventDefault();
					send(chatDraft);
				}
			};

			return react_jsx_runtime.jsxs(react_jsx_runtime.Fragment, { children: [
				react_jsx_runtime.jsx("button", {
					ref: buttonRef,
					type: "button",
					className: "dshOpa_toggle",
					"data-active": open || void 0,
					onClick: open ? closePanel : openPanel,
					title: open ? "Close the Ollama prompt assistant" : "Open the Ollama prompt assistant to refine the prompt",
					"aria-pressed": open,
					children: open ? "Ollama ▴" : "Ollama"
				}),
				open && react_jsx_runtime.jsxs("div", {
					ref: panelRef,
					className: "dshOpa_panel",
					role: "dialog",
					"aria-label": "Ollama prompt assistant",
					style: pos === null ? undefined : { left: pos.left, top: pos.top, width: size.width, height: size.height },
					children: [
						react_jsx_runtime.jsxs("div", {
							className: "dshOpa_header",
							onPointerDown: onHeaderPointerDown,
							children: [
								react_jsx_runtime.jsx("span", { className: "dshOpa_title", children: "Ollama prompt assistant" }),
								react_jsx_runtime.jsx("button", {
									type: "button",
									className: "dshOpa_close",
									"aria-label": "Close",
									onClick: closePanel,
									onPointerDown: (event) => event.stopPropagation(),
									children: "×"
								})
							]
						}),
						react_jsx_runtime.jsxs("div", {
							ref: msgsRef,
							className: "dshOpa_msgs",
							children: [
								messages.length === 0 && !busy && react_jsx_runtime.jsx("p", {
									className: "dshOpa_empty",
									children: "Describe what you want the AI to do. Ollama will help you shape the prompt — when you are happy, press Accept."
								}),
								messages.map((message, index) => react_jsx_runtime.jsx("div", {
									className: message.role === "user" ? "dshOpa_msg dshOpa_user" : "dshOpa_msg dshOpa_asst",
									children: message.content
								}, index)),
								busy && react_jsx_runtime.jsxs("span", {
									className: "dshOpa_thinking",
									children: [
										react_jsx_runtime.jsx("span", { className: "dshOpa_dot", "aria-hidden": true }),
										"Ollama is thinking…"
									]
								})
							]
						}),
						error !== null && react_jsx_runtime.jsx("div", {
							className: "dshOpa_error",
							role: "alert",
							children: error
						}),
						react_jsx_runtime.jsxs("div", {
							className: "dshOpa_inputRow",
							children: [
								react_jsx_runtime.jsx("textarea", {
									className: "dshOpa_input",
									value: chatDraft,
									onChange: (event) => setChatDraft(event.target.value),
									onKeyDown,
									rows: 1,
									placeholder: "Ask Ollama to refine the prompt…",
									disabled: busy
								}),
								react_jsx_runtime.jsx("button", {
									type: "button",
									className: "dshOpa_btn dshOpa_send",
									onClick: () => send(chatDraft),
									disabled: busy || chatDraft.trim() === "",
									children: "Send"
								})
							]
						}),
						react_jsx_runtime.jsxs("div", {
							className: "dshOpa_footer",
							children: [
								messages.length > 0 && react_jsx_runtime.jsx("button", {
									type: "button",
									className: "dshOpa_btn dshOpa_clear",
									onClick: clear,
									children: "Clear"
								}),
								react_jsx_runtime.jsx("button", {
									type: "button",
									className: "dshOpa_btn dshOpa_accept",
									onClick: accept,
									disabled: lastAssistant === null,
									children: "Accept"
								})
							]
						}),
						react_jsx_runtime.jsx("div", {
							className: "dshOpa_resize",
							onPointerDown: onResizePointerDown,
							"aria-hidden": true
						})
					]
				})
			] });
		}

		/** Required cordis services: only the slot registry. */
		const inject = ["slots"];

		/**
		 * Client plugin body: register the toggle into the composer's right
		 * tool-row seat.
		 * @param ctx - client root context.
		 */
		function apply(ctx) {
			ctx.slots.inject("conversation.input.right", () => ctx.slots.register({
				name: "conversation.input.right",
				id: "dsh-ollama-prompt-assistant"
			}, OllamaPromptToggle));
		}

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});