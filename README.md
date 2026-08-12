# Swissaustral Contact API

The project contains a Vite landing page in `frontend/` and a Bun contact API
in `backend/`. The landing page submits to the same-origin `/api/contact`
endpoint; the Vite development proxy forwards that path to Bun.

## Environment

Copy the examples before starting locally:

```sh
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Frontend variables:

- `VITE_TURNSTILE_SITE_KEY`: public Cloudflare Turnstile site key. It is safe
  to expose in browser JavaScript. The example uses Cloudflare's test site key.
- `BACKEND_URL`: Vite proxy target, normally `http://localhost:3000` locally.

Backend variables in `backend/.env`:

- `PORT`: API port, default `3000`.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`: SMTP credentials.
- `EMAIL_FROM`: verified sender address.
- `EMAIL_REPORT_TO`: address that receives contact reports.
- `PRODUCTION_ORIGIN`: exact browser origin allowed to submit, including the
  scheme and port when applicable (for example `http://localhost:5173`).
- `TURNSTILE_SECRET_KEY`: private Cloudflare secret; never put this in the
  frontend or commit it.
- `TURNSTILE_EXPECTED_HOSTNAME`: optional override for the Turnstile hostname
  check. When unset, the hostname from `PRODUCTION_ORIGIN` is required.
- `TURNSTILE_TIMEOUT_MS`: Turnstile verification timeout.
- `TRUST_PROXY`: set to `true` only when a trusted production proxy overwrites
  `X-Forwarded-For` before forwarding to Bun.
- `RATE_LIMIT_MAX` and `RATE_LIMIT_WINDOW_MS`: process-local submission limit.

When `TURNSTILE_SECRET_KEY` is absent, the API uses Cloudflare's test secret.
The frontend similarly falls back to Cloudflare's test site key when
`VITE_TURNSTILE_SITE_KEY` is absent. Use real keys and a real hostname in
production.

## Local startup

Run the services separately:

```sh
# terminal 1
cd backend
bun install
bun run dev

# terminal 2
cd frontend
npm ci
npm run dev
```

Open <http://localhost:5173>. Or use the development Compose setup:

```sh
docker compose -f compose.dev.yml up
```

The frontend is available at <http://localhost:5173> and Bun at
<http://localhost:3000>. Compose supplies the Cloudflare test site key unless
`VITE_TURNSTILE_SITE_KEY` is set in the shell or an env file.

## SMTP and TLS

The API uses Nodemailer with an SMTP submission connection. Configure a TLS
submission port such as `587` (STARTTLS) or a provider's TLS port and valid
credentials. Do not use plaintext SMTP credentials or disable certificate
verification. The API does not queue or retry mail; a successful request means
both the sender receipt and the internal report were accepted by the SMTP
transport.

## Production proxy requirements

Expose only the frontend/proxy publicly. Route same-origin `/api/contact`
requests to Bun and keep Bun off the public internet. The proxy must preserve
the request body and method, and must set/overwrite the browser-facing `Origin`
according to `PRODUCTION_ORIGIN` (the API rejects other origins).

If `TRUST_PROXY=true`, the proxy must overwrite `X-Forwarded-For` rather than
append untrusted client values, and Bun must be reachable only through that
proxy. Otherwise leave `TRUST_PROXY=false`. Use HTTPS in production so contact
data and Turnstile tokens are encrypted in transit.
