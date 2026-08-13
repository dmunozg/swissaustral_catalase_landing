# Production Deployment Implementation Plan

**Goal:** Add a minimal production Compose stack: Vite assets built then served by Nginx, with Nginx proxying `/api/` to an internal Bun API.
**Branch:** `feature/production-compose`
**Execution:** Current checkout, no worktree; tasks run sequentially.

## Current-State Findings
- `frontend/` is a Vite application; `npm run build` generates `frontend/dist`.
- Production builds already reject missing or Cloudflare test `VITE_TURNSTILE_SITE_KEY`.
- The browser defaults to same-origin `/api/contact` when `VITE_CONTACT_API_URL` is unset.
- Bun starts through `bun run start`, without watch mode or dev logs.
- Backend config enforces non-test Turnstile credentials when `PRODUCTION=true`.
- `TRUST_PROXY=true` uses the first `X-Forwarded-For` address for rate limiting.
- The external proxy is remote and host firewall-restricted; it terminates TLS for `https://biosensors.swissaustral.com`.

## Requirements
- Create `compose.yml`, consuming root `.env`.
- Build frontend in a Node stage and copy only generated static files into Nginx.
- Nginx serves static assets and proxies `/api/` to Bun.
- Bun remains unexposed to the host.
- Set `PRODUCTION=true`, `NODE_ENV=production`, `TRUST_PROXY=true`.
- Preserve the external proxy's sanitized `X-Forwarded-For`; do not append Docker/Nginx peer addresses.
- Use `PRODUCTION_ORIGIN=https://biosensors.swissaustral.com`.
- No TLS configuration in this repository.

## Non-Goals
- SSL certificates or public reverse-proxy configuration.
- Database, queue, health-check framework, orchestration, or multi-instance rate limiting.
- Replacing the existing development Compose stack.

## Acceptance Criteria
- [ ] `docker compose up --build` serves the landing page through Nginx.
- [ ] Requests to `/api/contact` retain method, body, `Origin`, and sanitized client address when reaching Bun.
- [ ] Bun has no published host port.
- [ ] Production build and runtime reject insecure/missing Turnstile configuration.
- [ ] Compose configuration validates with production `.env`.

## Minimal-Solution Decision
**Selected ladder rung:** 4, native Docker multi-stage build, Compose networking, and Nginx configuration.
**Why it holds:** Existing Vite and Bun scripts already provide all required build/runtime behavior.
**Skipped:** custom images, an HTTP framework, TLS, Docker secrets migration, and orchestration health dependencies.
**Add only when:** automated deployment needs image registry publishing, secret-manager integration, or multi-replica behavior.

## Design
- Add `frontend/Dockerfile` with a Node Alpine build stage and an Nginx Alpine serving stage.
- Add `frontend/nginx.conf` to serve the SPA and proxy `/api/` to `http://backend:3000`, preserving `X-Forwarded-For` exactly.
- Add `backend/Dockerfile` to install production Bun dependencies and run `bun run start` without watch mode.
- Add root `compose.yml`: only frontend exposes port `80`; it passes the public Turnstile key at build time and forces `NODE_ENV=production`, `PRODUCTION=true`, and `TRUST_PROXY=true` for the backend.
- Update `.env.example` and README with deployment values and the external-proxy firewall/XFF contract.

## Expected File Map
- `compose.yml`: production services and environment wiring.
- `frontend/Dockerfile`: static frontend multi-stage image.
- `frontend/nginx.conf`: static serving and API proxy behavior.
- `backend/Dockerfile`: minimal Bun runtime image.
- `.env.example`: documented production-ready variable values.
- `README.md`: production launch and proxy/firewall contract.

## Tasks

### Task 1: Add Container Images

**Objective:** Make independently buildable frontend and backend production images.

**Expected files (advisory):**
- Create: `frontend/Dockerfile`
- Create: `frontend/nginx.conf`
- Create: `backend/Dockerfile`

**Steps:**
1. Build the frontend with `npm ci` and `npm run build`, receiving `VITE_TURNSTILE_SITE_KEY` only as a build argument.
2. Copy only Vite's generated output into the final Nginx image.
3. Configure Nginx static fallback and `/api/` proxying to `backend:3000`.
4. Preserve external `X-Forwarded-For` exactly when proxying to Bun.
5. Install Bun production dependencies from `bun.lock`, copy backend source, and run the existing non-watch start script.

**Non-goals:**
- Do not add TLS, proxy caching, compression tuning, or a new application server.

**Verification:**
- Run: `docker build --build-arg VITE_TURNSTILE_SITE_KEY=<real-key> -t swissaustral-frontend ./frontend`
- Expected: Vite production build succeeds and image builds.
- Run: `docker build -t swissaustral-backend ./backend`
- Expected: Bun image builds without dev command/watch mode.

**Complete when:**
- Both images build and Nginx is configured to route `/api/` to Bun by service name.

### Task 2: Add Production Compose Configuration

**Objective:** Connect the two images with production-only runtime settings.

**Expected files (advisory):**
- Create: `compose.yml`

**Steps:**
1. Define frontend and backend services built from their Dockerfiles.
2. Publish only frontend port `80`; omit backend `ports`.
3. Load root `.env` for build/runtime values.
4. Pass `VITE_TURNSTILE_SITE_KEY` to the frontend build only.
5. Force backend `NODE_ENV=production`, `PRODUCTION=true`, and `TRUST_PROXY=true`.
6. Leave `VITE_CONTACT_API_URL` unset for the frontend build.

**Non-goals:**
- Do not publish Bun, introduce named volumes, or alter `compose.dev.yml`.

**Verification:**
- Run: `docker compose config --quiet`
- Expected: valid Compose configuration.
- Run: `docker compose up --build`
- Expected: frontend listens on port 80 and backend is available only by Compose service DNS.

**Complete when:**
- The frontend is reachable through Nginx and its API proxy resolves `backend`.

### Task 3: Document Production Operations

**Objective:** Make the deployment configuration safe to operate.

**Expected files (advisory):**
- Modify: `.env.example`
- Modify: `README.md`

**Steps:**
1. Document production values: `NODE_ENV=production`, `PRODUCTION=true`, `PRODUCTION_ORIGIN=https://biosensors.swissaustral.com`, and real Turnstile/SMTP credentials.
2. State that `TRUST_PROXY=true` requires the external proxy to overwrite XFF and host firewall rules limiting Nginx port 80 to that proxy.
3. Add production startup, validation, and teardown commands.
4. State that TLS remains the external proxy's responsibility.

**Non-goals:**
- Do not commit secrets or configure external proxy/firewall infrastructure.

**Verification:**
- Run: `docker compose config --quiet`
- Expected: documented production `.env` structure resolves correctly.
- Run: `docker compose up --build`
- Expected: a local page request succeeds; `/api/contact` reaches Bun through Nginx.

**Complete when:**
- A deployer can configure `.env`, build, run, and understand the forwarding trust boundary.

## Final Verification
- `docker compose config --quiet`
- `docker compose up --build`
- `curl -I http://localhost/`
- `bun test && bunx tsc --noEmit` from `backend/`
- `npm ci && npm run build` from `frontend/`

## Risks And Approved Simplifications
- Rate limiting remains process-local; introduce shared storage only when running multiple Bun replicas.
- Trusting XFF is safe only while the host firewall restricts Nginx port 80 to the external proxy and that proxy overwrites XFF.
- Static Nginx uses no TLS; the external proxy is responsible for HTTPS termination and forwarding the public origin.

## Execution Handoff
- Create or switch to `feature/production-compose` from the agreed base branch.
- Do not use git worktrees.
- Execute tasks sequentially and verify each before continuing.
