import pkg from "../../../package.json";

// THE BUILD ID — the same constant in the page the Worker renders and in the client bundle, so the client can
// tell whether the markup it was handed came from its own build (hydrate.tsx). `scripts/build-id.mjs` writes
// the git short hash here before a build; "dev" is what a checkout and the tests see.
export const BUILD_ID = "dev";
/** The package's version, shown with the build id at the foot of Settings ("v0.0.1 · 517285f"). */
export const APP_VERSION: string = pkg.version;
