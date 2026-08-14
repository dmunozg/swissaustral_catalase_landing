# CTA Highlight Implementation Plan

**Goal:** Make every conversion CTA prominent with an accessible Swissaustral-red treatment.
**Branch:** `feature/cta-highlight`
**Execution:** Current checkout, no worktree; tasks run sequentially.

## Current-State Findings
- All CTAs use the shared `Button` component in `frontend/src/main.jsx`.
- Conversion CTAs currently use inconsistent variants: white, outline, and transparent.
- Existing brand red `#e6282f` is already used for the navigation CTA, but white text on it is below AA contrast at `4.27:1`.
- Existing darker red `#c81e25` meets contrast with the warm white text at `5.48:1`.

## Requirements
- Apply the highlight treatment to all conversion CTAs: header, mobile menu, hero, sections, and contact form submit.
- Preserve secondary navigation and “See how it works” as lower-emphasis links.
- Keep the scientific, confident visual tone.
- Maintain accessible keyboard focus, hover, disabled, and reduced-motion behavior.

## Non-Goals
- No copy, layout, form, routing, or backend changes.
- No new dependencies, tokens system, or animation work.

## Acceptance Criteria
- [ ] Every conversion CTA uses one visually consistent red style.
- [ ] CTA text meets WCAG AA contrast.
- [ ] Secondary links remain visually subordinate.
- [ ] The page remains usable at mobile and desktop breakpoints.
- [ ] Frontend production build succeeds.

## Minimal-Solution Decision
**Selected ladder rung:** Reuse the existing `Button` component and CSS.
**Why it holds:** A single semantic `accent` variant provides consistent styling without structural changes or dependencies.
**Skipped:** Per-section selectors, new components, design tokens, and custom effects.
**Add only when:** A future CTA needs a distinct semantic role beyond primary conversion.

## Design
- Add `.button--accent` using `#c81e25` as its default background, warm-white text, and the existing darker/intentional hover state.
- Include a visible `:focus-visible` outline suitable for both light and dark section backgrounds.
- Change all conversion CTAs to `variant="accent"`.
- Leave the hero’s explanatory text link and standard navigation links unchanged.
- Keep the current compact header CTA sizing while applying the accent treatment.

## Expected File Map
- `frontend/src/main.jsx`: assign the semantic accent variant to conversion CTAs.
- `frontend/src/styles.css`: define accessible accent, hover, focus, and disabled presentation.

## Tasks

### Task 1: Introduce One Accessible Accent CTA Variant

**Objective:** Establish the shared highlighted CTA style.

**Context and interfaces:**
- `Button` renders `button button--${variant}` class names.
- Existing red `#c81e25` provides at least 4.5:1 contrast against `#fbfaf7`.

**Expected files (advisory):**
- Modify: `frontend/src/styles.css`

**Steps:**
1. Add `.button--accent` with accessible dark-red background and warm-white foreground.
2. Add hover and keyboard-focus styles consistent with existing button motion.
3. Preserve the existing disabled behavior.

**Non-goals:**
- Do not alter secondary link styling or unrelated buttons.

**Verification:**
- Run: `npm run build` from `frontend/`
- Expected: Vite build completes successfully.
- Manually verify focus, hover, and disabled submit states on light, teal, dark, and red section backgrounds.

**Complete when:**
- The shared accent style is readable and visually consistent in every context.

### Task 2: Apply Accent Variant to Conversion Paths

**Objective:** Make all lead-generation CTAs visually prominent while retaining hierarchy.

**Context and interfaces:**
- Task 1 must provide `.button--accent`.
- The `Button` component accepts a `variant` string, and the form submit button receives button classes directly.

**Expected files (advisory):**
- Modify: `frontend/src/main.jsx`

**Steps:**
1. Change the header and mobile-menu “Talk to a scientist” actions to the accent variant.
2. Change the hero, sectional technical-meeting/evaluation/detail-request CTAs to the accent variant.
3. Change the contact-form submit action to the accent variant.
4. Keep “See how it works” and regular navigation links unchanged.

**Non-goals:**
- Do not change CTA labels, anchors, click handlers, form submission logic, or responsive layout.

**Verification:**
- Run: `npm run build` from `frontend/`
- Expected: successful production build.
- Review at mobile and desktop widths: each conversion CTA is red, readable, keyboard-focusable, and does not compete with secondary links.

**Complete when:**
- Every confirmed conversion CTA uses the same accessible highlight treatment.

## Final Verification
- `npm run build` from `frontend/`
- Manual mobile and desktop visual review of the header, hero, each section CTA, mobile menu, and contact submit button.
- Keyboard-tab through CTA states to confirm visible focus.

## Risks and Approved Simplifications
- The more accessible darker red is used for filled CTA surfaces; the existing brighter red remains available for decorative emphasis.

## Execution Handoff
- Create or switch to `feature/cta-highlight` from the agreed base branch.
- Do not use git worktrees.
- Execute tasks sequentially and verify each before continuing.
- Expected file lists are advisory; justify necessary deviations.
- Do not expand beyond the stated goal and non-goals.
