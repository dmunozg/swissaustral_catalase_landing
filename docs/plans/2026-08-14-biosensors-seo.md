# Biosensors SEO Implementation Plan

**Goal:** Make `/biosensors/` crawlable without JavaScript, improve its metadata and keyword targeting, add the live Swissaustral favicon, and link both page logos to the Swissaustral home page.

**Branch:** `feature/biosensors-seo`
**Execution:** Current checkout, no worktree; tasks run sequentially.

## Current-State Findings
- The landing page is a Vite React SPA; production HTML has an empty `#root`.
- Vite is configured with `base: "/biosensors/"`.
- `index.html` has only a title and short description.
- The live Swissaustral favicon is `https://www.swissaustral.com/wp-content/uploads/2026/05/favicon.png`.
- The page has one H1 and a valid H2/H3 hierarchy.
- Robots, sitemaps, host redirects, and content outside `/biosensors/` are out of scope.

## Requirements
- Pre-render the landing content into `dist/index.html` at build time.
- Preserve React interactivity through hydration.
- Add canonical, Open Graph, Twitter, and truthful JSON-LD metadata.
- Preserve the existing hero H1: "Your oxidase sensor may be running out of room." Keyword targeting is provided by the title, description, structured data, and page body.
- Copy the live favicon into this project and reference it with the Vite base path.
- Link the top-bar and footer Swissaustral logos to `https://www.swissaustral.com`.
- Add a focused build-output regression test.

## Non-Goals
- No robots.txt, sitemap, proxy, hostname redirect, or WordPress changes.
- No new dependencies or framework migration.
- No new social-card image asset; reuse the existing hero image.
- No image-search markup for the decorative Patagonia background.

## Acceptance Criteria
- [ ] A production `curl` response includes the page H1 and body content inside `#root`.
- [ ] Client JavaScript hydrates the pre-rendered page without changing behavior.
- [ ] Canonical URL is `https://swissaustral.com/biosensors/`.
- [ ] Metadata includes title, description, Open Graph, Twitter, JSON-LD, and favicon links.
- [ ] The H1 remains "Your oxidase sensor may be running out of room."
- [ ] Both rendered logo links use `https://www.swissaustral.com`.
- [ ] The SEO build-output test passes after a production build.

## Minimal-Solution Decision
**Selected ladder rung:** Reuse Vite's documented SSR build/prerender pattern and the installed `react-dom/server`.

**Why it holds:** This is one static route with no server data. A small prerender script produces crawlable HTML without adding an SSR framework or runtime server.

**Skipped:** React framework migration, SSR hosting, a prerender dependency, sitemap work, and a new share image.

## Design
- Extract `App` from `main.jsx` so both browser and server entries render the same component.
- Keep client rendering in `main.jsx`; use `hydrateRoot` when `#root` already contains pre-rendered markup, otherwise use `createRoot` for local development.
- Run a standard Vite client build, an SSR entry build, then a Node prerender script that injects `renderToString(<App />)` into `dist/index.html`.
- Keep the current `npm run build` contract so Docker requires no changes.
- Ensure reveal content remains visible without JavaScript, rather than leaving server-rendered sections permanently transparent.
- Add static metadata in `index.html`; no runtime SEO library is needed.

## Expected File Map
- `frontend/package.json`: split the build into client, server, and prerender stages.
- `frontend/src/App.jsx`: shared landing component.
- `frontend/src/main.jsx`: client hydration entry.
- `frontend/src/entry-server.jsx`: SSR render entry.
- `frontend/scripts/prerender.mjs`: inject rendered markup into the built HTML.
- `frontend/index.html`: metadata, JSON-LD, favicon links, and progressive-enhancement marker.
- `frontend/src/styles.css`: make reveal styling JavaScript-enhanced only.
- `frontend/public/favicon.png`: copied from the live Swissaustral favicon.
- `frontend/src/seo-build.test.js`: assert the built HTML contract.

## Tasks

### Task 1: Define the SEO Output Contract

**Objective:** Add a regression test that fails until the production artifact contains crawlable content, required metadata, and the two external logo links.

**Expected files (advisory):**
- Create: `frontend/src/seo-build.test.js`

**Steps:**
1. Add a Node built-in test that reads `frontend/dist/index.html`.
2. Assert the rendered root includes the established hero H1.
3. Assert canonical, title, description, Open Graph, Twitter, JSON-LD, favicon, and both external logo links.
4. Run the test against the current build to confirm failure due to the empty root and missing tags.

**Non-goals:**
- Do not add a test framework or browser test suite.

**Verification:**
- Run: `node --test src/seo-build.test.js` from `frontend/`
- Expected: failure before implementation, identifying missing rendered content and metadata.

**Complete when:**
- The output contract is encoded in a focused regression test.

### Task 2: Pre-render and Hydrate the Landing Page

**Objective:** Build static semantic HTML for the known landing route while retaining the existing React experience and external logo links.

**Expected files (advisory):**
- Modify: `frontend/package.json`
- Create: `frontend/src/App.jsx`
- Modify: `frontend/src/main.jsx`
- Create: `frontend/src/entry-server.jsx`
- Create: `frontend/scripts/prerender.mjs`
- Modify: `frontend/index.html`
- Modify: `frontend/src/styles.css`

**Steps:**
1. Move `App` and `MetricCard` into `App.jsx`, leaving browser startup in `main.jsx`.
2. Replace the top-bar `#top` logo action with an external `https://www.swissaustral.com` link and wrap the footer logo in the same link.
3. Add an SSR entry exporting the static app render.
4. Update build scripts to run Vite's client build, Vite's SSR build, then the Node prerender script.
5. Inject the rendered app markup into the built `#root` and remove the temporary SSR build output.
6. Hydrate existing markup in production; retain `createRoot` for empty development roots.
7. Make scroll-reveal hiding opt in only after JavaScript is active, preserving visible content for non-JavaScript crawlers and users.

**Non-goals:**
- Do not change form, Turnstile, analytics, navigation, or visual behavior beyond the required external logo destinations.
- Do not introduce server-side data fetching or a Node runtime in production.

**Verification:**
- Run: `VITE_TURNSTILE_SITE_KEY=<configured non-test key> npm run build` from `frontend/`
- Run: `node --test src/seo-build.test.js` from `frontend/`
- Expected: build succeeds and the test confirms populated `dist/index.html` with both logo links.

**Complete when:**
- The built page contains the semantic app content and the browser hydrates it.

### Task 3: Add Metadata, Keyword Targeting, Schema, and Favicon

**Objective:** Complete the page's static search and sharing signals.

**Expected files (advisory):**
- Modify: `frontend/index.html`
- Modify: `frontend/src/App.jsx`
- Create: `frontend/public/favicon.png`
- Modify: `frontend/src/seo-build.test.js`

**Steps:**
1. Download the verified live favicon into `frontend/public/favicon.png`.
2. Reference it with Vite's `%BASE_URL%` so the deployed URL is `/biosensors/favicon.png`.
3. Set the 50-character title to `Cold-Active Catalase for Biosensors | Swissaustral`.
4. Replace the short description with: `Swissaustral Cold-Active Catalase for oxidase-based biosensors: manage hydrogen peroxide, recover oxygen, and evaluate sensor performance.`
5. Add canonical, Open Graph, and Twitter metadata using `https://swissaustral.com/biosensors/` and the existing Patagonia hero as the share image.
6. Add one truthful JSON-LD graph for `Organization`, `WebPage`, and `Product`; do not add price, availability, reviews, or unsupported performance claims.
7. Preserve the established H1: `Your oxidase sensor may be running out of room.`
8. Extend the build-output test for the final metadata values.

**Non-goals:**
- Do not create a new social image or modify the decorative hero's HTML semantics.
- Do not add claims beyond the page's existing qualified scientific copy.

**Verification:**
- Run: `VITE_TURNSTILE_SITE_KEY=<configured non-test key> npm run build` from `frontend/`
- Run: `node --test src/seo-build.test.js` from `frontend/`
- Manually verify: `curl --silent https://swissaustral.com/biosensors/` contains the H1, canonical link, JSON-LD, and favicon URL after deployment.

**Complete when:**
- The generated document provides complete on-page SEO metadata and visual branding.

## Final Verification
- `VITE_TURNSTILE_SITE_KEY=<configured non-test key> npm run build` from `frontend/`
- `node --test src/seo-build.test.js` from `frontend/`
- Confirm built HTML includes page content, metadata, favicon, and both logo URLs.

## Risks and Approved Simplifications
- The canonical URL assumes the existing in-scope production route remains `https://swissaustral.com/biosensors/`.
- Pre-rendering covers this one static route. Add a route-aware SSG solution only if more independently indexable pages are introduced.
