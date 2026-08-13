# Swissaustral Contact API

The project contains a Vite landing page in `frontend/` and a Bun contact API
in `backend/`. In development, the landing page sends contact requests directly
to Bun; in production, it uses the same-origin `/api/contact` endpoint routed
by Nginx.

## Environment

Copy the root example before starting locally or in production:

```sh
cp .env.example .env
```

Frontend variables:

- `VITE_TURNSTILE_SITE_KEY`: public Cloudflare Turnstile site key. It is safe
  to expose in browser JavaScript. Use a test site key only for local
  development; production requires the real site key.
- `VITE_CONTACT_API_URL`: direct development API URL, normally
  `http://127.0.0.1:3000/api/contact`. Leave it unset in production so the form
  uses Nginx's same-origin `/api/contact` route.

For production, set `VITE_TURNSTILE_SITE_KEY` to the real public Turnstile site
key. Do not use Cloudflare test values. The production frontend image receives
this value only at build time.

Backend variables in `.env`:

- `PORT`: API port, default `3000`.
- `PRODUCTION`: set to `true` only in production. It requires a configured,
  non-test `TURNSTILE_SECRET_KEY` at startup.
- `NODE_ENV`: set to `production` for the production Compose stack.
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

During development, the API may use Cloudflare's test secret and the frontend
may fall back to Cloudflare's test site key when those values are absent. The
production stack rejects missing or test Turnstile credentials and requires a
real `VITE_TURNSTILE_SITE_KEY` at image build time.

## Local startup

For local development, set `NODE_ENV=development`, `PRODUCTION=false`,
`PRODUCTION_ORIGIN=http://localhost:5173`, and `TRUST_PROXY=false` in `.env`.
Use local/test Turnstile values and valid development SMTP settings. Then run
the services separately:

```sh
# terminal 1
set -a; source .env; set +a
cd backend
bun install
bun run dev

# terminal 2
cd frontend
set -a; source ../.env; set +a
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

## Production startup and operations

Use the default `compose.yml` for production. First copy `.env.example` to
`.env` and replace every placeholder with real Turnstile and SMTP credentials.
The production origin must remain:
`https://biosensors.swissaustral.com`.

```sh
# Validate the resolved production configuration.
docker compose config --quiet

# Build images and start Nginx plus the internal Bun API.
docker compose up --build -d

# Stop and remove the production containers and network.
docker compose down
```

Only Nginx publishes host port 80; Bun is reachable through Compose networking
only. TLS terminates at the external proxy and is out of scope for this
repository. Configure the host firewall to allow port 80 only from that proxy.

Because production sets `TRUST_PROXY=true`, the external proxy must overwrite
`X-Forwarded-For` (not append to it) before forwarding requests to Nginx. Do
not expose port 80 to arbitrary clients; the firewall restriction and proxy
overwrite are the trust boundary for the client address used by rate limiting.

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
