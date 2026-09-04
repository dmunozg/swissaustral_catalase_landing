# Floating WhatsApp Button Implementation Plan

**Goal:** Add a globally available bottom-right WhatsApp click-to-chat button configured through build-time environment variables, with safe development placeholders.
**Branch:** `feature/whatsapp-floating-button`
**Execution:** Current checkout, no worktree; tasks run sequentially.

## Current-State Findings
- The frontend is Vite + React with static prerendering and hydration.
- `frontend/src/App.jsx` owns the global layout; `frontend/src/styles.css` owns global styles.
- `App.jsx` already uses `import.meta.env.DEV` to select a development Turnstile fallback.
- `frontend/src/google-tag.js` publishes GTM events to `window.dataLayer`.
- Production frontend settings are build-time `VITE_*` variables forwarded by the Dockerfile and Compose files.
- No installed icon package includes the WhatsApp brand icon; use an inline SVG.
- Frontend checks use Node's built-in test runner; no frontend lint or typecheck command exists.

## Requirements
- Display an accessible circular WhatsApp button fixed to the bottom-right at all viewport widths.
- Read its destination from `VITE_WHATSAPP_PHONE` and its opening text from `VITE_WHATSAPP_MESSAGE`.
- Use placeholders in development when either setting is missing.
- Construct an encoded `https://wa.me/<digits>?text=<encoded-message>` link.
- Track clicks with `{ event: "whatsapp_click" }` in GTM.
- Avoid overlap with the open mobile menu and preserve keyboard, focus, touch-target, responsive, and safe-area behavior.
- Validate and document production settings and pass them through Docker/Compose builds.

## Non-Goals
- WhatsApp Cloud API, embedded widgets, backend sending, multiple messages, localization, campaign routing, or unrelated refactors.

## Acceptance Criteria
- [ ] The button appears bottom-right on mobile, tablet, and desktop.
- [ ] Valid settings render a `wa.me` link with an encoded message.
- [ ] Development supplies placeholders for absent settings.
- [ ] Production builds fail for missing message/phone or invalid phone format.
- [ ] The phone is 7-15 digits including country code, with no formatting characters.
- [ ] The link uses an accessible label, 44px-plus target, focus state, `target="_blank"`, and `rel="noopener noreferrer"`.
- [ ] The open mobile navigation hides the button.
- [ ] Clicks publish `whatsapp_click` to GTM.
- [ ] Docker/Compose/example documentation exposes both settings.
- [ ] Unit and prerendered-build tests pass.

## Minimal-Solution Decision
**Selected ladder rung:** 4 — native platform/framework behavior.
**Why it holds:** A styled React anchor using WhatsApp's native `wa.me` link, existing CSS, and existing GTM event convention meets the request without a dependency or API integration.
**Skipped:** Cloud API, third-party widget, new icon package, backend endpoint, and reusable chat abstraction.
**Add only when:** Multiple destinations, localized messages, agent availability routing, or deeper attribution becomes an explicit requirement.

## Design
Add a pure `whatsapp.js` helper that validates a digits-only phone number and builds the URL using `encodeURIComponent`. Resolve `VITE_WHATSAPP_PHONE` and `VITE_WHATSAPP_MESSAGE` in `App.jsx`, with the development placeholders `10000000000` and `Hello, I'm interested in Cold-Active Catalase.` when `import.meta.env.DEV` is true. Render one static `WhatsAppButton` anchor inside `.site-shell`, with an aria-hidden inline WhatsApp SVG, new-tab security attributes, and the GTM handler. CSS will fix it above the header, provide safe-area-aware responsive offsets, and hide it when the mobile menu sibling is open. Vite will require both variables on production builds and validate the phone with `^[0-9]{7,15}$`.

## Expected File Map
- `frontend/src/whatsapp.js`: URL validation/construction.
- `frontend/src/whatsapp.test.js`: helper contract tests.
- `frontend/src/App.jsx`: environment resolution and rendered FAB.
- `frontend/src/styles.css`: FAB layout and interaction styles.
- `frontend/src/google-tag.js`: WhatsApp click event.
- `frontend/src/google-tag.test.js`: click-event test.
- `frontend/src/seo-build.test.js`: static-output assertions.
- `frontend/vite.config.js`: production variable validation.
- `frontend/Dockerfile`, `compose.yml`, `compose.dev.yml`: variable forwarding.
- `.env.example`, `frontend/.env.example`, `README.md`: settings documentation.

## Tasks

### Task 1: Define and test the WhatsApp URL contract

**Objective:** Provide a pure helper for safe WhatsApp universal links.

**Expected files (advisory):**
- Create: `frontend/src/whatsapp.js`
- Create: `frontend/src/whatsapp.test.js`

**Steps:**
1. Add failing tests for valid digits-only numbers, message encoding, invalid/missing numbers, and the 7-15-digit range.
2. Implement the smallest pure helper.
3. Run the focused test.

**Non-goals:** Country-specific parsing, formatting normalization, or multiple messages.

**Verification:** `cd frontend && node --test src/whatsapp.test.js`

**Complete when:** Valid inputs produce a correct `wa.me` URL and invalid inputs cannot produce a link.

### Task 2: Add the accessible button and GTM event

**Objective:** Render and style the global control using development fallbacks and existing analytics conventions.

**Expected files (advisory):**
- Modify: `frontend/src/App.jsx`
- Modify: `frontend/src/styles.css`
- Modify: `frontend/src/google-tag.js`
- Modify: `frontend/src/google-tag.test.js`

**Steps:**
1. Add a failing GTM event test.
2. Implement the server-safe tracking helper.
3. Add development fallback constants and configuration resolution.
4. Add the inline-SVG button once inside `.site-shell`.
5. Add fixed, responsive, focus, hover, safe-area, and mobile-menu CSS.

**Non-goals:** Chat panels, tooltips, badges, or changes to unrelated navigation/buttons.

**Verification:** `cd frontend && node --test src/google-tag.test.js && node --test src/whatsapp.test.js`

**Complete when:** The button is accessible, opens the configured chat, tracks the click, and does not conflict with mobile navigation.

### Task 3: Enforce and propagate deployment configuration

**Objective:** Require valid production settings while preserving no-config local development.

**Expected files (advisory):**
- Modify: `frontend/vite.config.js`
- Modify: `frontend/Dockerfile`
- Modify: `compose.yml`
- Modify: `compose.dev.yml`
- Modify: `.env.example`
- Modify: `frontend/.env.example`
- Modify: `README.md`

**Steps:**
1. Validate required production variables and the phone format in Vite.
2. Forward both build arguments in Docker and Compose.
3. Pass through development settings without Compose defaults.
4. Document public build-time configuration and development fallbacks.

**Non-goals:** Runtime config, secret management, or backend environment changes.

**Verification:** `docker compose config --quiet`, `docker compose -f compose.dev.yml config --quiet`, and a malformed production `npm run build` that fails clearly.

**Complete when:** Direct and containerized builds have documented, validated configuration paths.

### Task 4: Verify prerendering and regressions

**Objective:** Ensure configured static output includes the correct secure, accessible link.

**Expected files (advisory):**
- Modify: `frontend/src/seo-build.test.js`

**Steps:**
1. Assert the configured `wa.me` URL, label, target, and rel in built HTML.
2. Build with test settings.
3. Run all frontend tests and manual responsive/accessibility checks.

**Non-goals:** Visual-regression infrastructure or backend tests.

**Verification:**
```sh
cd frontend
VITE_TURNSTILE_SITE_KEY=production-test-placeholder VITE_GOOGLE_TAG_MANAGER_ID=GTM-TEST123 VITE_WHATSAPP_PHONE=41790000000 VITE_WHATSAPP_MESSAGE="Hello, I am interested in Cold-Active Catalase." npm run build
node --test src/*.test.js
```

**Complete when:** The build and all tests pass, and manual checks meet the acceptance criteria.

## Risks and Approved Simplifications
- `VITE_*` values are public build-time settings, not secrets.
- The phone is validated rather than normalized to avoid unintended routing.
- A single message serves the current English-only page; add message variants only for an explicit campaign or localization need.

## Execution Handoff
- Create or switch to `feature/whatsapp-floating-button` from `main`.
- Do not use git worktrees.
- Execute tasks sequentially and verify each before continuing.
- Do not expand beyond stated requirements and non-goals.
