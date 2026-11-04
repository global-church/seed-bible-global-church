// THE INTERFACE LANGUAGE, as a signal on its own: what `routeOf` (state/reading/route.ts) reads to build an address,
// and so what the Worker's bundle imports. Kept apart from i18n/index.ts, whose locale glob (`import.meta.glob`) is
// Vite's alone and cannot be bundled for the edge.
import { signal } from "@preact/signals";

export const language = signal("en");
