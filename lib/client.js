window.__ModuleLoader__.load({
	id: "ollama-prompt-assistant",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");

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
				if (enabled) {
					setEnabled(false);
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

			const label = busy ? "…" : enabled ? "Ollama ✓" : "Ollama";
			return react_jsx_runtime.jsx("button", {
				type: "button",
				onClick: toggle,
				disabled: busy,
				title: error ?? "Send the draft to Ollama and use its output as the prompt",
				"aria-pressed": enabled,
				style: {
					display: "inline-flex",
					alignItems: "center",
					height: "24px",
					padding: "0 8px",
					border: "1px solid var(--dsw-alias-border-l2, #d0d0d0)",
					borderRadius: "6px",
					background: enabled ? "var(--dsw-alias-state-success-primary, #2f9e44)" : "transparent",
					color: enabled ? "#fff" : "var(--dsw-alias-label-secondary, #555)",
					fontSize: "12px",
					lineHeight: "24px",
					cursor: busy ? "wait" : "pointer",
					opacity: busy ? 0.6 : 1
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
				id: "ollama-prompt-assistant"
			}, OllamaPromptToggle));
		}

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
