# Google Tag Manager Implementation Plan

**Goal:** Replace `gtag.js` with GTM while sourcing the container ID from `VITE_GOOGLE_TAG_MANAGER_ID`.
**Branch:** `feature/google-tag-manager`
**Execution:** Current checkout, no worktree; tasks run sequentially.

## Current-State Findings
- `frontend/src/google-tag.js` dynamically loads `gtag.js`; this is Google Tag rather than the requested GTM container.
- `frontend/src/main.jsx` initializes the existing tag using `VITE_GOOGLE_TAG_ID`.
- `frontend/src/App.jsx` records successful contact submissions as `generate_lead` without form data.
- `frontend/index.html` is the static template containing the required `<head>` and `<body>` insertion points.
- Vite already loads and validates build-time environment variables in `frontend/vite.config.js`.

## Requirements
- Insert both official GTM snippets in their required HTML positions.
- Substitute the container ID at build time from `VITE_GOOGLE_TAG_MANAGER_ID`.
- Production builds must fail if the variable is missing or does not match `GTM-[A-Z0-9]+`.
- Development may omit GTM when the variable is unset.
- Preserve the successful-form `generate_lead` event without sending form data.

## Non-Goals
- Configure tags, triggers, or variables in the GTM portal.
- Add consent management.
- Change when successful lead submissions are recorded.

## Acceptance Criteria
- [ ] Configured HTML contains the official GTM script immediately inside `<head>`.
- [ ] Configured HTML contains the GTM `<noscript>` iframe immediately inside `<body>`.
- [ ] Both snippets use the value of `VITE_GOOGLE_TAG_MANAGER_ID` rather than a hard-coded identifier.
- [ ] Production builds reject missing or malformed GTM identifiers.
- [ ] Unconfigured development omits both GTM snippets.
- [ ] Successful contact submissions push `{ event: "generate_lead" }` to `window.dataLayer` without form data.
- [ ] No legacy `gtag.js` loader remains.

## Minimal-Solution Decision
**Selected ladder rung:** 4 — native framework capability.
**Why it holds:** Vite's `transformIndexHtml` hook can inject build-time environment values into both required HTML positions without adding a dependency or runtime loader.
**Skipped:** A custom templating system, runtime configuration endpoint, and hard-coded container identifier.
**Add only when:** Runtime-switchable container IDs become an explicit deployment requirement.

## Design
Add a small Vite `transformIndexHtml` plugin that reads the trimmed `VITE_GOOGLE_TAG_MANAGER_ID`, validates it for production builds, and injects the official script and noscript snippets when configured. The hook will omit both snippets during unconfigured development and ensure production output contains no unresolved placeholder.

Remove the legacy `gtag.js` initializer and its client-entry call. Keep the existing successful-submission call site, but implement `trackGenerateLead()` as a direct `window.dataLayer.push({ event: "generate_lead" })` operation so GTM can consume the custom event.

Rename the existing build argument and documented environment variable throughout deployment configuration to `VITE_GOOGLE_TAG_MANAGER_ID`.

## Expected File Map
- `frontend/vite.config.js`: validate the ID and inject GTM snippets.
- `frontend/index.html`: provide explicit insertion markers for both snippets.
- `frontend/src/main.jsx`: remove legacy Google Tag initialization.
- `frontend/src/google-tag.js`: retain only GTM-compatible lead event publishing.
- `frontend/src/google-tag.test.js`: test the data-layer event contract.
- `frontend/src/seo-build.test.js`: test built GTM markup and placement.
- `frontend/Dockerfile`: pass the renamed build argument.
- `compose.yml`: pass the renamed production build argument.
- `compose.dev.yml`: expose the renamed development variable.
- `.env.example`: document the GTM variable.
- `frontend/.env.example`: document the GTM variable.
- `README.md`: document GTM configuration and lead event behavior.

## Tasks

### Task 1: Add environment-driven GTM injection

**Objective:** Emit valid GTM markup from the Vite HTML pipeline and preserve lead tracking through the GTM data layer.

**Context and interfaces:**
- Input: `VITE_GOOGLE_TAG_MANAGER_ID`.
- Valid production format: `GTM-[A-Z0-9]+`.
- Output event: `{ event: "generate_lead" }` pushed to `window.dataLayer` after a successful submission.

**Expected files (advisory):**
- Modify: `frontend/vite.config.js`
- Modify: `frontend/index.html`
- Modify: `frontend/src/main.jsx`
- Modify: `frontend/src/google-tag.js`
- Test: `frontend/src/google-tag.test.js`
- Test: `frontend/src/seo-build.test.js`

**Steps:**
1. Add assertions that the generated HTML contains both configured snippets in the required positions and no legacy `gtag.js` loader.
2. Update the lead-event unit test to assert an object is pushed directly to an existing data layer without form data.
3. Run focused tests and confirm they fail for the expected missing behavior.
4. Validate the GTM identifier during production builds.
5. Inject both official snippets through `transformIndexHtml` when a valid configured identifier is present.
6. Remove the legacy initializer and change lead tracking to direct data-layer publishing.
7. Run focused tests and confirm they pass.

**Non-goals:**
- Modify the contact form success criteria.
- Add additional analytics events.
- Configure GTM workspace behavior.

**Verification:**
- Run: `node --test src/google-tag.test.js`
- Run: `VITE_TURNSTILE_SITE_KEY=production-test-placeholder VITE_GOOGLE_TAG_MANAGER_ID=GTM-TEST123 npm run build`
- Run: `node --test src/seo-build.test.js`
- Expected: unit and build-contract tests pass, and generated HTML has correctly positioned GTM snippets.

**Complete when:**
- The legacy loader is absent, both snippets are environment-driven, and the lead event uses the GTM data layer.

### Task 2: Update deployment configuration

**Objective:** Ensure every supported build path supplies and documents `VITE_GOOGLE_TAG_MANAGER_ID`.

**Context and interfaces:**
- Production builds require the variable.
- Development may leave it blank to omit GTM.

**Expected files (advisory):**
- Modify: `frontend/Dockerfile`
- Modify: `compose.yml`
- Modify: `compose.dev.yml`
- Modify: `.env.example`
- Modify: `frontend/.env.example`
- Modify: `README.md`

**Steps:**
1. Replace `VITE_GOOGLE_TAG_ID` with `VITE_GOOGLE_TAG_MANAGER_ID` in Docker and Compose configuration.
2. Update environment examples with the required format and production behavior.
3. Update README configuration and conversion-event guidance for GTM.
4. Search the repository to ensure active code and configuration no longer reference the old variable.

**Non-goals:**
- Add runtime configuration.
- Add secrets management for the public container identifier.

**Verification:**
- Run: `docker compose config --quiet`
- Expected: Compose configuration is valid when required environment values are supplied.

**Complete when:**
- All build paths and user-facing setup documentation consistently use the renamed GTM variable.

## Final Verification
- `node --test src/google-tag.test.js`
- `VITE_TURNSTILE_SITE_KEY=production-test-placeholder VITE_GOOGLE_TAG_MANAGER_ID=GTM-TEST123 npm run build`
- `node --test src/seo-build.test.js`
- Confirm `VITE_TURNSTILE_SITE_KEY=production-test-placeholder npm run build` fails with a clear GTM-variable error.
- Confirm a build with a malformed GTM identifier fails with a clear format error.
- `docker compose config --quiet` with required environment values supplied.

## Risks and Approved Simplifications
- The identifier is baked into static HTML, so changing it requires rebuilding the frontend. Upgrade to runtime configuration only if deployments must change containers without rebuilding.
- Consent management remains outside this change by explicit scope.

## Execution Handoff
- Create or switch to `feature/google-tag-manager` from the agreed base branch.
- Do not use git worktrees.
- Execute tasks sequentially and verify each before continuing.
- Expected file lists are advisory; justify necessary deviations.
- Do not expand beyond the stated goal and non-goals.
