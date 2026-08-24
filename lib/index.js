/**
 * ollama-prompt-assistant — host (node) half.
 *
 * Pure UI plugin: the empty `apply` exists so the package appears as a cordis
 * plugin entry in the host Loader (which is what the client-modules node half
 * scans to discover the `dsh.client` declaration and serve the browser half).
 * All behavior lives in the browser half (`./client`).
 */
export function apply() {}
