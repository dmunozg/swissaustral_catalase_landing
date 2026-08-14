# Biosensors Path Routing Implementation Plan

**Goal:** Serve the landing page at `https://swissaustral.com/biosensors/` through external Traefik, preserving assets, contact submissions, Turnstile validation, and client-IP forwarding.

**Branch:** `feature/biosensors-path-routing`
**Execution:** Current checkout, no worktree; tasks run sequentially.

## Current-State Findings
- Production configuration currently uses `https://biosensors.swissaustral.com`.
- Root-absolute frontend asset and API URLs would escape a `/biosensors` router.
- Nginx and Bun expect root paths, so Traefik must remove the public prefix.
- Traefik runs on another VM and is outside this repository's deployment/test scope.

## Requirements
- Public route: `https://swissaustral.com/biosensors/`.
- Keep assets and contact posts under `/biosensors/`.
- Set `PRODUCTION_ORIGIN=https://swissaustral.com`.
- Add README instructions for external Traefik file-provider configuration.
- Document Turnstile hostname and forwarding-header requirements.

## Non-Goals
- Editing, deploying, or validating the external Traefik VM.
- Committing live Traefik configuration, certificates, IPs, or credentials.
- Changing Nginx, Bun routes, Compose topology, or DNS.
- Adding root `/api/contact` routing.

## Acceptance Criteria
- [ ] Production frontend assets resolve from `/biosensors/assets/...`.
- [ ] The contact form targets `/biosensors/api/contact`, which Traefik rewrites to Nginx's existing `/api/contact`.
- [ ] `.env.example` and README use `https://swissaustral.com`.
- [ ] README supplies complete file-based Traefik router/service/middleware instructions.
- [ ] README clearly separates repository verification from external operator validation.

## Minimal-Solution Decision
**Selected ladder rung:** Native Vite `base` support and Traefik `stripPrefix`.

**Why it holds:** The current Nginx/Bun application already works from `/`; no application-server route changes are needed.

**Skipped:** A second reverse proxy, path-aware backend APIs, Docker-discovered Traefik configuration, and repository-owned infrastructure files.

## Design
- Vite production builds use `base: "/biosensors/"`; local `vite dev` remains at `/`.
- Frontend public asset URLs and the default API URL derive from `import.meta.env.BASE_URL`.
- `.env.example` sets `PRODUCTION_ORIGIN=https://swissaustral.com`; existing backend hostname validation then expects `swissaustral.com`.
- README will document this external Traefik dynamic configuration, with the real production frontend address substituted by the operator:

```yaml
http:
  middlewares:
    biosensors-strip-prefix:
      stripPrefix:
        prefixes:
          - /biosensors

  routers:
    biosensors:
      entryPoints:
        - websecure
      rule: "Host(`swissaustral.com`) && (Path(`/biosensors`) || PathPrefix(`/biosensors/`))"
      middlewares:
        - biosensors-strip-prefix
      service: biosensors
      tls: {}

  services:
    biosensors:
      loadBalancer:
        servers:
          - url: "http://<production-frontend-host>:80"
```

- README will also show file-provider activation in Traefik static configuration:

```yaml
providers:
  file:
    directory: /etc/traefik/dynamic
    watch: true
```

- README will require a non-insecure Traefik forwarded-header configuration and an application-host firewall allowing port 80 only from Traefik.

## Expected File Map
- `frontend/vite.config.js`: production base path.
- `frontend/src/main.jsx`: base-aware asset and contact URLs.
- `.env.example`: production origin.
- `README.md`: production URL, Traefik setup, external-validation handoff.
- `docs/plans/2026-08-14-biosensors-path-routing.md`: approved plan only.

## Tasks

### Task 1: Make the Production Build Prefix-Aware

**Objective:** Keep production browser requests under `/biosensors/`.

**Expected files (advisory):**
- Modify: `frontend/vite.config.js`
- Modify: `frontend/src/main.jsx`

**Steps:**
1. Configure Vite to use `/biosensors/` for builds and `/` for development.
2. Build the fallback contact endpoint from `import.meta.env.BASE_URL`.
3. Build logo public-asset URLs from the same base.
4. Inspect generated output for prefixed asset and contact paths.

**Non-goals:**
- No backend, Nginx, or local-development routing changes.
- No frontend test framework.

**Verification:**
- Run: `npm run build` from `frontend/`
- Expected: successful build.
- Run: `rg '/biosensors/(assets|api/contact)' dist`
- Expected: generated resources use the mounted path.
- Run: `rg '["'\"']/?assets/' dist`
- Expected: no root-absolute browser asset paths remain.

**Complete when:**
- The built frontend does not request root `/assets` or root `/api/contact`.

### Task 2: Align Configuration and Document External Traefik Setup

**Objective:** Update production origin configuration and give operators exact file-based Traefik instructions.

**Expected files (advisory):**
- Modify: `.env.example`
- Modify: `README.md`

**Steps:**
1. Set the production origin to `https://swissaustral.com`.
2. Replace production subdomain references with the `/biosensors/` public route.
3. Add the static file-provider and dynamic router/service/`stripPrefix` YAML examples above.
4. State that the operator must replace the frontend upstream placeholder, reuse their actual secure entrypoint and certificate resolver, and ensure this router wins over any general Swissaustral router.
5. Document the forwarding-header boundary: do not use `forwardedHeaders.insecure`; configure `trustedIPs` only when a known proxy precedes Traefik; restrict the app host's port 80 to Traefik.
6. Document Turnstile cutover: allow `swissaustral.com` on the production widget and use its corresponding real site/secret key pair.
7. Add external validation commands and explicitly label them as operator-run on the Traefik VM/public environment.

**Non-goals:**
- No direct Traefik VM access, configuration deployment, firewall changes, or public-route testing.
- No retention of the subdomain as an application fallback.

**Verification:**
- Run: `docker compose config --quiet`
- Expected: valid Compose configuration with the revised environment example.
- Review README examples against current Traefik v3 file-provider syntax.
- Expected: infrastructure-only values remain obvious placeholders.

**Complete when:**
- An external operator has unambiguous instructions to configure and validate the route.

### Task 3: Provide External Validation Handoff

**Objective:** Document, but do not perform, external-route validation.

**Expected files (advisory):**
- Modify: `README.md`

**Steps:**
1. Provide public HTTPS checks for `/biosensors/` and a generated `/biosensors/assets/...` URL.
2. Describe the expected browser-network request: `POST /biosensors/api/contact`, forwarded upstream as `/api/contact`.
3. Require the Traefik operator to verify router activation, upstream health, TLS, route precedence, and sanitized client forwarding from their dashboard/logs.
4. State that successful contact-form validation requires a real deployed Turnstile configuration and therefore cannot be performed from this repository.

**Non-goals:**
- Do not execute the listed commands or claim their results.
- Do not add remote test automation.

**Verification:**
- Repository verification only: `npm run build`, backend tests/typecheck, and `docker compose config --quiet`.
- External operator verification: documented only.

**Complete when:**
- README clearly assigns all external Traefik and public-domain validation to the infrastructure operator.

## Final Verification
- `npm run build` from `frontend/`
- `bun test && bunx tsc --noEmit` from `backend/`
- `docker compose config --quiet`
- README review for exact routing, prefix stripping, origin, Turnstile, and external validation handoff.

## Risks and Approved Simplifications
- The production frontend address, Traefik entrypoint, and certificate resolver remain infrastructure-specific placeholders.
- Both `/biosensors` and `/biosensors/` are routed; no canonical redirect is added. Add one only if SEO explicitly requires canonicalization.
