# WhatsApp FAB Mitigations Plan

**Goal:** Replace the incorrect glyph, enlarge the desktop FAB, and verify visibility in Firefox at `522×981`.
**Branch:** `feature/whatsapp-floating-button`
**Execution:** Current checkout, no worktree; tasks run sequentially.

## Current-State Findings
- `lucide-react` is installed, but Lucide v1 excludes brand icons.
- The WhatsApp FAB uses a custom inline SVG in `frontend/src/App.jsx`.
- The FAB is `56px` at every breakpoint; its desktop rule changes only its offsets.
- The FAB is intentionally hidden only while the mobile navigation is open.
- At `522px`, no breakpoint should otherwise hide the FAB; reproduce in Firefox to distinguish SVG rendering from whole-button visibility.

## Requirements
- Use the supplied Font Awesome Free v7.3.1 WhatsApp path and `viewBox="0 0 448 512"`.
- Keep the current green background and render the icon white.
- Keep the mobile FAB at `56px`; increase desktop (`≥980px`) to `64px`.
- Scale the desktop icon proportionally.
- Ensure the closed-menu FAB and glyph remain visible at Firefox `522×981`.
- Continue hiding the FAB while the mobile menu is open.

## Non-Goals
- Adding Font Awesome as a dependency.
- Changing WhatsApp URL, environment, analytics, positioning, or menu behavior.
- Adding visual-regression infrastructure.

## Acceptance Criteria
- [ ] The supplied WhatsApp glyph renders in white on the existing green background.
- [ ] Mobile/tablet FAB remains `56×56px`.
- [ ] Desktop FAB is `64×64px`.
- [ ] Firefox at `522×981` shows the FAB and glyph while the menu is closed.
- [ ] Opening the mobile menu hides the FAB; closing it restores the FAB.
- [ ] Existing frontend tests and production build pass.

## Minimal-Solution Decision
**Selected ladder rung:** 6 — replace the existing inline path and adjust existing CSS.
**Why it holds:** The supplied SVG can replace the current inline glyph without a new dependency.
**Skipped:** Installing Font Awesome or adding a visual-regression framework.
**Add only when:** A supported brand-icon library becomes a project-wide need.

## Design
Replace the two current paths with the supplied Font Awesome WhatsApp path, preserving `aria-hidden="true"` because the anchor already has an accessible name. Keep the SVG white via `currentColor`; set it to block display to avoid inline baseline behavior. Retain the `56px` base control and set its `≥980px` dimensions to `64px`; increase the icon size in the same media rule. Add explicit `0px` safe-area fallbacks to the `env()` calls. Preserve the open-mobile-menu visibility rule, then test both closed and open menu states in Firefox at the requested viewport.

## Expected File Map
- `frontend/src/App.jsx`: supplied WhatsApp SVG.
- `frontend/src/styles.css`: responsive sizing, SVG display, and safe-area fallbacks.
- `docs/plans/2026-09-04-whatsapp-fab-mitigations.md`: approved execution plan.

## Tasks

### Task 1: Replace the WhatsApp glyph

**Objective:** Render the supplied WhatsApp icon within the existing accessible FAB.

**Expected files (advisory):**
- Modify: `frontend/src/App.jsx`

**Steps:**
1. Replace the two-path SVG with the supplied Font Awesome path and its `448×512` viewBox.
2. Preserve `aria-hidden="true"`, the current anchor attributes, and click tracking.

**Non-goals:** Add Font Awesome as a dependency or alter the FAB destination and analytics.

**Verification:** Build output contains the new SVG and current accessible anchor attributes.

**Complete when:** The supplied glyph is the only SVG geometry rendered by the FAB.

### Task 2: Refine responsive rendering

**Objective:** Keep the control visible and correctly sized from mobile through desktop.

**Expected files (advisory):**
- Modify: `frontend/src/styles.css`

**Steps:**
1. Keep the base FAB at `56px` and size the portrait-oriented icon to fit without clipping.
2. Make the SVG a block-level element and retain white `currentColor` fill.
3. Add `0px` fallback values to safe-area env calls.
4. At `min-width: 980px`, set the FAB to `64×64px` and enlarge the icon proportionally.
5. Preserve the existing open-menu visibility rule.

**Non-goals:** Change FAB colors, offsets, URL behavior, or breakpoints.

**Verification:** Computed dimensions are `56×56px` at 522px and `64×64px` at desktop width.

**Complete when:** The new glyph remains visible and centered in both control sizes.

### Task 3: Validate Firefox and regressions

**Objective:** Reproduce the reported viewport and validate visibility, menu interaction, tests, and build output.

**Expected files (advisory):**
- No source changes expected.

**Steps:**
1. Run the frontend with development placeholders.
2. Inspect Firefox at exactly `522×981` with the menu closed, then open and close the menu.
3. Inspect a desktop viewport for the larger control.
4. Run the frontend test suite and configured production build.

**Non-goals:** Add browser automation or visual-regression infrastructure.

**Verification:**
```sh
cd frontend
node --test src/*.test.js
VITE_TURNSTILE_SITE_KEY=production-test-placeholder VITE_GOOGLE_TAG_MANAGER_ID=GTM-TEST123 VITE_WHATSAPP_PHONE=41790000000 VITE_WHATSAPP_MESSAGE="Hello, I am interested in Cold-Active Catalase." npm run build
```

**Complete when:** Firefox checks, all tests, and the production build pass.

## Final Verification
- Validate `56×56px` at `522×981` and `64×64px` at desktop width in Firefox.
- Verify opening the mobile menu hides the FAB and closing it restores it.
- Run the frontend test suite and configured production build.

## Risks and Approved Simplifications
- The supplied Font Awesome Free SVG is inlined rather than installed as a package; update it only if a newer approved brand asset is provided.

## Execution Handoff
- Continue on `feature/whatsapp-floating-button` in the current checkout.
- Do not use git worktrees.
- Execute tasks sequentially and do not expand beyond the stated goal and non-goals.
