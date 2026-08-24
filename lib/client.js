window.__ModuleLoader__.load({
	id: "dsh-ollama-prompt-assistant",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");

		// Inject the spinner keyframes once (guarded, module-loader style).
		const SPIN_CSS_ID = "dsh-ollama-prompt-assistant/spin";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(SPIN_CSS_ID) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-ollama-prompt-assistant";
			tag.dataset.pluginCss = SPIN_CSS_ID;
			tag.textContent = "@keyframes dsh-ollama-spin{to{transform:rotate(360deg)}}";
			document.head.appendChild(tag);
		}

		// The OLLAMA service. `ollama run ALIENTELLIGENCE/aipromptassistant`
		// with a prompt is the CLI wrapper over the HTTP generate endpoint we
		// call here (the browser cannot spawn the CLI directly).
		const OLLAMA_URL = "http://localhost:11434/api/generate";
		const OLLAMA_MODEL = "ALIENTELLIGENCE/aipromptassistant";

		/**
		 * Send `prompt` to the OLLAMA service and return its text output.
		 * @param prompt - the composer draft to hand to the model.
		 * @returns the model's response text (trimmed).
		 */
		async function runOllama(prompt) {
			const res = await fetch(OLLAMA_URL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					model: OLLAMA_MODEL,
					prompt,
					stream: false
				})
			});
			if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
			const data = await res.json();
			const output = (data.response ?? "").trim();
			if (output === "") throw new Error("Ollama returned an empty response");
			return output;
		}

		/**
		 * The composer tool-row toggle (`conversation.input.right`).
		 *
		 * While the OLLAMA model is running, the button shows a spinner and a
		 * distinct amber "Rewriting…" state so the user knows it is processing.
		 * When switched on, the current draft is sent to the OLLAMA service and
		 * its output replaces the draft, becoming the prompt the AI receives.
		 * Switching off just turns the toggle back off (the draft is kept).
		 *
		 * Props come from the framework: `input` (InputZone owner share) and
		 * `inputActions` (the standard session kit's public draft write path).
		 */
		function OllamaPromptToggle({ input, inputActions }) {
			const [enabled, setEnabled] = react.useState(false);
			const [busy, setBusy] = react.useState(false);
			const [error, setError] = react.useState(null);

			const toggle = async () => {
				if (busy || enabled) {
					if (enabled) setEnabled(false);
					return;
				}
				const draft = input?.draft ?? "";
				if (draft.trim() === "") {
					setError("Input is empty");
					return;
				}
				setBusy(true);
				setError(null);
				try {
					const output = await runOllama(draft);
					inputActions?.setDraft(output);
					setEnabled(true);
				} catch (cause) {
					setError(cause instanceof Error ? cause.message : String(cause));
				} finally {
					setBusy(false);
				}
			};

			const spinner = react_jsx_runtime.jsx("span", {
				"aria-hidden": true,
				style: {
					display: "inline-block",
					width: "10px",
					height: "10px",
					border: "2px solid rgba(255,255,255,0.35)",
					borderTopColor: "#fff",
					borderRadius: "50%",
					marginRight: "6px",
					flex: "none",
					animation: "dsh-ollama-spin 0.7s linear infinite"
				}
			});

			const label = busy
				? react_jsx_runtime.jsxs(react_jsx_runtime.Fragment, { children: [spinner, "Rewriting…"] })
				: enabled ? "Ollama ✓" : "Ollama";

			const title = error ?? (busy
				? "Sending the draft to Ollama…"
				: "Send the draft to Ollama and use its output as the prompt");

			return react_jsx_runtime.jsx("button", {
				type: "button",
				onClick: toggle,
				disabled: busy,
				title,
				"aria-pressed": enabled,
				style: {
					display: "inline-flex",
					alignItems: "center",
					gap: "4px",
					height: "24px",
					padding: "0 8px",
					border: error
						? "1px solid var(--dsw-alias-state-error-primary, #f03e3e)"
						: "1px solid var(--dsw-alias-border-l2, #d0d0d0)",
					borderRadius: "6px",
					background: busy
						? "var(--dsw-alias-state-warn-primary, #e8590c)"
						: enabled
							? "var(--dsw-alias-state-success-primary, #2f9e44)"
							: "transparent",
					color: busy || enabled ? "#fff" : "var(--dsw-alias-label-secondary, #555)",
					fontSize: "12px",
					lineHeight: "24px",
					cursor: busy ? "progress" : "pointer",
					transition: "background 150ms ease, border-color 150ms ease"
				},
				children: label
			});
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
