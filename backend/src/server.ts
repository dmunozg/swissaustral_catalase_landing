import { loadConfig } from "./config";
import { createContactHandler } from "./contact";
import { createMailer } from "./email";

interface TurnstileResponse { success?: boolean; action?: string; hostname?: string }

export function createTurnstileVerifier(config: ReturnType<typeof loadConfig>) {
  return async (token: string, request: Request): Promise<boolean> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.turnstileTimeoutMs ?? 5_000);
    try {
      const form = new URLSearchParams({ secret: config.turnstileSecret, response: token });
      const clientIp = request.headers.get("cf-connecting-ip");
      if (clientIp) form.set("remoteip", clientIp);
      const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: form, signal: controller.signal });
      if (!response.ok) return false;
      const result = (await response.json()) as TurnstileResponse;
      return result.success === true && result.action === "contact" && result.hostname === config.turnstileExpectedHostname;
    } catch { return false; } finally { clearTimeout(timeout); }
  };
}

const config = loadConfig();
let server: {
  port?: number;
  requestIP(request: Request): { address: string } | null;
};
const contact = createContactHandler({
  config,
  verifyTurnstile: createTurnstileVerifier(config),
  sendMail: createMailer(config),
  clientKey: (request) =>
    config.trustProxy
      ? request.headers.get("x-forwarded-for")?.split(",", 1)[0]?.trim() || "unknown"
      : server.requestIP(request)?.address || "unknown",
});
const securityHeaders = { "Cache-Control": "no-store", "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'", "Cross-Origin-Resource-Policy": "same-origin", "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY" };

server = Bun.serve({ port: config.port, async fetch(request) { if (new URL(request.url).pathname === "/api/contact") return contact(request); return new Response("Not found", { status: 404, headers: securityHeaders }); } });
console.log(`Contact API listening on ${server.port ?? config.port}`);
