# Google Tag Implementation Plan

**Goal:** Conditionally load a configured Google tag and send a GA4 `generate_lead` event only after a contact submission succeeds.

**Branch:** `feature/google-tag-conversions`
**Execution:** Current checkout, no worktree; tasks run sequentially.

## Current-State Findings
- The Vite frontend is static; `VITE_*` variables are compiled at image build time.
- `submitContactForm` in `frontend/src/main.jsx` has a single successful-response path.
- No frontend test framework exists; Node's built-in test runner is available.
- Google’s current docs require a concrete tag ID; they do not provide a shared development/test Google tag ID.

## Requirements
- Use public `VITE_GOOGLE_TAG_ID`.
- When unset or blank, do not inject the Google script or initialize `dataLayer`, preventing Google-tag cookies.
- Send GA4's recommended `generate_lead` event after the contact API returns success.
- Do not send form contents or other PII to Google.
- Pass the variable through local Compose and production Docker builds.
- Document configuration and GA4 key-event setup.

## Non-Goals
- Google Ads conversion labels or `send_to` configuration.
- Consent-banner implementation.
- Tracking unsuccessful, blocked, or rate-limited submissions.

## Acceptance Criteria
- [ ] Empty `VITE_GOOGLE_TAG_ID` produces no Google tag script or `dataLayer`.
- [ ] A configured ID loads and configures `gtag.js`.
- [ ] Successful contact submissions enqueue exactly one `generate_lead` event.
- [ ] Failed submissions do not enqueue a conversion event.
- [ ] Frontend builds with and without the Google tag ID.

## Minimal-Solution Decision
**Selected ladder rung:** Reuse Vite environment variables, native script injection, and `gtag.js`.
**Skipped:** Tag Manager, a tracking SDK, a fallback test ID, and new dependencies.
**Add only when:** Ads conversion tracking is requested, which requires a configured conversion destination/label.

## Design
- Add a small, dependency-free Google-tag module that:
  - trims and validates the supplied ID;
  - exits without touching browser globals when absent;
  - otherwise initializes `window.dataLayer`, defines `window.gtag`, queues `js` and `config`, and appends the official `gtag.js` script;
  - exposes a `generate_lead` event function.
- Initialize once at frontend startup.
- Invoke the event function only after `response.ok`, before resetting the form.
- Provide `VITE_GOOGLE_TAG_ID` as an optional build argument in Docker/Compose.
- Document marking `generate_lead` as a key event in GA4.

## Expected File Map
- `frontend/src/google-tag.js`: conditional tag initialization and event dispatch.
- `frontend/src/google-tag.test.js`: built-in Node tests for missing/configured IDs and event queueing.
- `frontend/src/main.jsx`: initialize tracking and emit after accepted contact submission.
- `frontend/Dockerfile`: accept/pass `VITE_GOOGLE_TAG_ID` during build.
- `compose.yml`, `compose.dev.yml`: supply optional public tag ID.
- `.env.example`, `frontend/.env.example`, `README.md`: configuration and operator guidance.

## Tasks

### Task 1: Add Conditional Google Tag Module

**Objective:** Load Google Tag only when a non-empty ID is configured and verify its queued commands.

**Expected files (advisory):**
- Create: `frontend/src/google-tag.js`
- Create: `frontend/src/google-tag.test.js`

**Steps:**
1. Implement conditional initialization using the official `gtag.js` URL and `config` command.
2. Ensure an absent/whitespace ID leaves `window.dataLayer` and the document untouched.
3. Implement an event helper that queues `gtag("event", "generate_lead")`.
4. Add Node built-in tests using minimal fake browser globals.

**Non-goals:**
- Do not add dependencies or a test framework.
- Do not transmit form data.

**Verification:**
- Run: `node --test src/google-tag.test.js` from `frontend/`
- Expected: tests cover disabled initialization, configured initialization, and lead-event queueing.

**Complete when:**
- The module safely does nothing without an ID and correctly queues commands with one.

### Task 2: Wire Lead Conversion to Successful Submission

**Objective:** Initialize tracking at application startup and emit one event for an accepted contact request.

**Expected files (advisory):**
- Modify: `frontend/src/main.jsx`

**Steps:**
1. Initialize the tag with `import.meta.env.VITE_GOOGLE_TAG_ID`.
2. Call the lead event helper only in the existing `response.ok` path.
3. Keep all validation, Turnstile, error, form-reset, and accessibility behavior unchanged.

**Non-goals:**
- Do not count button clicks, client validation failures, Turnstile failures, API failures, or 429 responses as conversions.

**Verification:**
- Run: `node --test src/google-tag.test.js` from `frontend/`
- Run: `VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA npm run build` from `frontend/`
- Expected: tests and the tag-less build pass.

**Complete when:**
- Only accepted form submissions call `generate_lead`.

### Task 3: Expose Build Configuration and Document Operations

**Objective:** Make the optional public tag ID available in development and production builds.

**Expected files (advisory):**
- Modify: `frontend/Dockerfile`
- Modify: `compose.yml`
- Modify: `compose.dev.yml`
- Modify: `.env.example`
- Modify: `frontend/.env.example`
- Modify: `README.md`

**Steps:**
1. Add optional `VITE_GOOGLE_TAG_ID` build handling to the frontend Docker image and production Compose build args.
2. Pass it through development Compose without a fallback value.
3. Document that it is public, baked in at build time, and can be left blank to disable tracking.
4. Document that `generate_lead` must be marked as a GA4 key event.

**Non-goals:**
- Do not add a Google-provided test ID fallback; none is documented.
- Do not claim GA4 configuration is automated by this repository.

**Verification:**
- Run: `VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA VITE_GOOGLE_TAG_ID=G-TEST123456 npm run build` from `frontend/`
- Run: `docker compose config --quiet`
- Expected: both succeed.
- Manually verify: with the ID omitted, no request goes to `googletagmanager.com`; with it configured, a successful form submission queues `generate_lead`.

**Complete when:**
- Both deployment paths support the optional ID and operators can configure GA4 correctly.

## Final Verification
- `node --test src/google-tag.test.js` from `frontend/`
- Tag-less and configured `npm run build` runs
- `docker compose config --quiet`
- Browser network/dataLayer verification for enabled and disabled configurations

## Risks and Approved Simplifications
- GA4 must be configured separately to treat `generate_lead` as a key event.
- No consent mechanism is added; add one if applicable privacy requirements require consent before analytics cookies.
