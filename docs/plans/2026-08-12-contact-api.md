# Contact API Implementation Plan

**Goal:** Add a secure Bun/TypeScript contact API with SMTP delivery, Turnstile validation, and a wired landing-page form.
**Branch:** `feature/contact-api`
**Execution:** Current checkout, no worktree; tasks run sequentially.

## Requirements
- Move the Vite application to `frontend/` and create a separate `backend/`.
- Use Bun and strict TypeScript for the API.
- Accept same-origin `POST /api/contact` only; validate bounded JSON, fields, origin, Turnstile, and rate limits before email delivery.
- Fall back to Cloudflare test keys when Turnstile environment values are absent.
- Send an escaped HTML/text receipt to the sender and a report to `EMAIL_REPORT_TO` through TLS SMTP.

## Non-Goals
- No database, CRM, queue, CORS, or direct browser access to a separate API origin.

## Minimal-Solution Decision
**Selected ladder rung:** 5, reuse Bun built-ins and Nodemailer only for SMTP.
**Skipped:** HTTP framework, ORM, mail queue, React Turnstile package, CAPTCHA proxy, and custom SMTP implementation.
**Add only when:** durable retries or multi-instance rate limiting become required.

## Tasks

### Task 1: Reorganize the Vite Application

**Objective:** Move the existing frontend into `frontend/` without changing visible behavior.

**Expected files (advisory):**
- Move: root Vite files, `src/`, and `public/` into `frontend/`
- Modify: `compose.dev.yml`, `.gitignore`
- Create: `frontend/vite.config.js`, `frontend/.env.example`

**Steps:**
1. Preserve existing modified frontend files while relocating source, assets, manifest, lockfile, and Vite HTML entrypoint into `frontend/`.
2. Add the Vite development proxy for `/api`, defaulting locally to the Bun service.
3. Update Docker Compose for separate frontend and Bun backend services.
4. Ignore real environment files and retain committed examples.

**Non-goals:** Do not alter visual design, migrate frontend JavaScript to TypeScript, or move ignored output/dependencies.

**Verification:** Run `npm ci && npm run build` from `frontend/`; it must complete successfully.

### Task 2: Define the Typed Contact Contract and Tests

**Objective:** Establish the strict backend project, public request contract, and failing behavior tests.

**Expected files (advisory):**
- Create: `backend/package.json`, `backend/tsconfig.json`, `backend/src/config.ts`
- Create: `backend/src/contact.ts`, `backend/src/contact.test.ts`
- Create: `backend/.env.example`

**Steps:**
1. Set up Bun `dev`, `start`, `test`, and `typecheck` scripts, strict TypeScript, and Nodemailer types.
2. Define validated configuration and required SMTP/sender/recipient/production-origin settings.
3. Define bounded `name`, `email`, `message`, and `turnstileToken` contract.
4. Write focused Bun tests for valid payloads, invalid payloads, Turnstile failure, bad origin, and rate limits with injected network/mail seams.
5. Confirm tests fail before implementation.

**Non-goals:** Do not implement SMTP delivery or HTTP serving, or add a database/mock server/testing framework.

**Verification:** `bun test` must fail for missing behavior; `bunx tsc --noEmit` must pass for the scaffold.

### Task 3: Implement Secure Verification and Email Delivery

**Objective:** Implement the minimal contact flow so valid submissions verify and send both messages.

**Expected files (advisory):**
- Modify: `backend/src/config.ts`, `backend/src/contact.ts`
- Create: `backend/src/email.ts`, `backend/src/server.ts`
- Test: `backend/src/contact.test.ts`

**Steps:**
1. Implement bounded parsing, validation, origin checks, security headers, and in-memory rate limiting.
2. Verify Turnstile with timeout, `contact` action, expected hostname, and fallback test secret.
3. Configure TLS-only SMTP delivery.
4. Build escaped HTML/text receipt and report templates; report uses visitor email as `Reply-To`.
5. Send both messages after verification and return generic safe failures.
6. Make the focused tests pass, including no delivery for rejected inputs.

**Non-goals:** Do not implement retries, queues, exactly-once delivery, or message/credential/token logging.

**Verification:** `bun test` and `bunx tsc --noEmit` pass from `backend/`.

### Task 4: Wire the Landing Form and Document Operations

**Objective:** Replace the placeholder flow with Turnstile-backed API submission and document operations.

**Expected files (advisory):**
- Modify: `frontend/index.html`, `frontend/src/main.jsx`, `frontend/src/styles.css`
- Create: `README.md`
- Modify: `compose.dev.yml`

**Steps:**
1. Add Cloudflare implicit-render script.
2. Add a real widget and accessible pending/success/error states.
3. Post to `/api/contact`, handle safe errors, and reset Turnstile after use.
4. Document environment variables, local startup, SMTP TLS, test-key fallback, and production proxy/header requirements.
5. Validate through the frontend proxy.

**Non-goals:** Do not expose the Turnstile secret or add CORS/direct separate-origin API access.

**Verification:** `npm run build` in `frontend/`; `bun test && bunx tsc --noEmit` in `backend/`; `docker compose -f compose.dev.yml up` smoke test.

## Risks and Approved Simplifications
- SMTP can partially deliver; add durable retries only when guarantees are required.
- The limiter is process-local; add shared storage only with multiple Bun instances.
- With `TRUST_PROXY=true`, the production proxy must overwrite forwarding headers and be Bun's only public route.
