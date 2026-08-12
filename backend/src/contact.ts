import type { AppConfig } from "./config";

export const CONTACT_LIMITS = {
  name: 100,
  email: 254,
  message: 5_000,
  turnstileToken: 2_048,
} as const;

export const CONTACT_MAX_BODY_BYTES = 16_384;

const ATTEMPTS_CLEANUP_BUDGET = 16;

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
  turnstileToken: string;
}

export type MailKind = "receipt" | "report";

export interface ContactMail {
  kind: MailKind;
  payload: ContactPayload;
}

export interface ContactDependencies {
  config: AppConfig;
  verifyTurnstile: (token: string, request: Request) => Promise<boolean>;
  sendMail: (mail: ContactMail) => Promise<void>;
  now?: () => number;
  clientKey?: (request: Request) => string;
}

export type ContactHandler = (request: Request) => Promise<Response>;

const SECURITY_HEADERS = {
  "Cache-Control": "no-store",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

function response(status: number, body: Record<string, string>): Response {
  return Response.json(body, { status, headers: SECURITY_HEADERS });
}

async function readJson(request: Request): Promise<unknown | null> {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
  if (contentType !== "application/json") return null;

  const contentLength = request.headers.get("content-length");
  if (contentLength !== null) {
    const length = Number(contentLength);
    if (!Number.isSafeInteger(length) || length < 0 || length > CONTACT_MAX_BODY_BYTES) {
      return null;
    }
  }

  if (!request.body) return null;
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > CONTACT_MAX_BODY_BYTES) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

export function parseContactPayload(value: unknown): ContactPayload | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const payload = value as Record<string, unknown>;
  const fields = ["name", "email", "message", "turnstileToken"] as const;
  if (fields.some((field) => typeof payload[field] !== "string")) return null;

  const result = payload as Record<(typeof fields)[number], string>;
  if (
    fields.some(
      (field) =>
        result[field].trim().length === 0 ||
        result[field].length > CONTACT_LIMITS[field],
    )
  ) {
    return null;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.email)) return null;
  if ([result.name, result.email, result.message, result.turnstileToken].some((field) => /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(field))) {
    return null;
  }

  return {
    name: result.name.trim(),
    email: result.email.trim(),
    message: result.message.trim(),
    turnstileToken: result.turnstileToken.trim(),
  };
}

function defaultClientKey(request: Request, trustProxy: boolean): string {
  if (trustProxy) {
    const forwarded = request.headers.get("x-forwarded-for")?.split(",", 1)[0]?.trim();
    if (forwarded) return forwarded;
  }
  return request.headers.get("cf-connecting-ip")?.trim() || "unknown";
}

export function createContactHandler(dependencies: ContactDependencies): ContactHandler {
  const attempts = new Map<string, number[]>();
  const now = dependencies.now ?? Date.now;
  const clientKey = dependencies.clientKey ?? ((request) => defaultClientKey(request, dependencies.config.trustProxy));
  let cleanupIterator: ReturnType<typeof attempts.entries> | undefined;

  const cleanupExpiredAttempts = (cutoff: number) => {
    cleanupIterator ??= attempts.entries();
    for (let inspected = 0; inspected < ATTEMPTS_CLEANUP_BUDGET; inspected += 1) {
      const entry = cleanupIterator.next();
      if (entry.done) {
        cleanupIterator = attempts.entries();
        return;
      }
      const [key, timestamps] = entry.value;
      if (timestamps.every((timestamp) => timestamp <= cutoff)) attempts.delete(key);
    }
  };

  return async (request) => {
    if (request.method !== "POST" || new URL(request.url).pathname !== "/api/contact") {
      return response(404, { error: "Not found" });
    }

    if (request.headers.get("origin") !== dependencies.config.productionOrigin) {
      return response(403, { error: "Forbidden" });
    }

    const payload = parseContactPayload(await readJson(request));
    if (!payload) return response(400, { error: "Invalid request" });

    const currentTime = now();
    const key = clientKey(request);
    const cutoff = currentTime - dependencies.config.rateLimitWindowMs;
    cleanupExpiredAttempts(cutoff);
    const recent = (attempts.get(key) ?? []).filter((timestamp) => timestamp > cutoff);
    if (recent.length >= dependencies.config.rateLimitMax) {
      attempts.set(key, recent);
      return response(429, { error: "Too many requests" });
    }
    recent.push(currentTime);
    attempts.set(key, recent);

    if (!(await dependencies.verifyTurnstile(payload.turnstileToken, request))) {
      return response(403, { error: "Unable to verify request" });
    }

    try {
      await dependencies.sendMail({ kind: "receipt", payload });
      await dependencies.sendMail({ kind: "report", payload });
    } catch {
      return response(500, { error: "Unable to send message" });
    }

    return response(200, { message: "Message sent" });
  };
}
