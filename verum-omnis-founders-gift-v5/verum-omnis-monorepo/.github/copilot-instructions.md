### Quick context

This monorepo packages the Verum Omnis "Founders Release / Gift V5" distribution. It contains an immutable rules pack (runtime-verified), a stateless web UI, and optional video modules. The runtime is a Firebase Functions Express app (see `functions/index.js`) and Hosting serves the `web` folder. The `capacitor-app` contains a simple build script to copy `web` into `www` for mobile packaging.

### What you must preserve
- The immutable rulepack under `functions/assets/rules/` and the treaty under `functions/assets/treaty/` are authoritative. See `functions/assets/rules/manifest.json` — the functions startup verifies SHA-512 hashes and will throw on mismatch. Do not modify these files in any change unless the manifest is intentionally updated together.
- `functions/index.js` performs the immutable-pack check at cold-start. Any edits that change file layout, filenames, or hashing must update `manifest.json` and be justified in the PR description.

### Common developer tasks & commands
- Local function dev is standard Node 20 code under `functions/`. The firebase config points Hosting rewrites `/api/**` to the function named `api2` (see `firebase.json`).
- To build the mobile APK the repo uses a minimal `capacitor-app` script: run `npm run build` in `capacitor-app` (it copies `../web` into `www`).
- There is no top-level `package.json`; work inside `functions/` or `capacitor-app/` as needed.

### Patterns & conventions to follow
- Immutable vs changeable: treat `functions/assets/rules/**`, `functions/assets/treaty/**`, and `functions/assets/rules/manifest.json` as frozen. UI and assets under `web/` (HTML, CSS, `/assets/*`) are intended to be safe to change.
- API surface: follow the small express routes in `functions/index.js` (`/v1/verify`, `/v1/contradict`, `/v1/anchor`, `/v1/seal`). For client-side examples, see `web/verify.html` for fetch usage (base path: `/api`). Keep responses JSON-shaped as the app expects (e.g., anchor returns {ok:true,hash,issuedAt}).
- Video modules: `functions/video/*` and `functions/config.video.json` are present but disabled by default (see `config.video.json`). If enabling, mimic the guarded feature-flag pattern used there and ensure heavy processing is safe in Cloud Functions (watch time/size limits).

### Tests, CI and PR requirements
- CI must verify the manifest: include a step that calculates SHA-512 on listed files and compares to `functions/assets/rules/manifest.json`. The runtime enforces this, so CI should too.
- Any PR that updates immutable artifacts MUST include:
  - an updated `manifest.json` entry with new sha512 and version
  - a short explanation for the change and a signed-off note in PR body

### Examples from the repo (use these as templates)
- Startup integrity check: `functions/index.js` (function `verifyImmutablePack`) — replicate its checks in CI scripts.
- Seal generation: `functions/pdf/seal-template.js` — produces a PDF and is used by `/v1/seal`.
- Web client API usage: `web/verify.html` — client calls `location.origin + '/api/v1/...'` and expects JSON or a PDF blob for seal.

### When to ask a human
- If a change requires altering `manifest.json` or treaty files. Those are governance-level changes and require explicit human approval.
- For any long-running or large-video processing features (Cloud Functions limits and billing concerns).

### Editing contract (inputs/outputs)
- Inputs: edits are limited to UI (`/web/**`) or optional modules. Edits to `functions/**` must preserve the immutable-pack verification and API shapes.
- Outputs: Deployable artifacts are Firebase Hosting (`web`) and Functions (`functions`). The mobile APK lives under `capacitor-app/www` after build.

If anything above is unclear or you need CI script examples to verify the manifest, say so and I will add them. 
