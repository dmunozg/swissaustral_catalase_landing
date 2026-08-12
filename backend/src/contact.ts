import type { AppConfig } from "./config";

export const CONTACT_LIMITS = {
  name: 100,
  email: 254,
  message: 5_000,
  turnstileToken: 2_048,
} as const;

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

  return {
    name: result.name.trim(),
    email: result.email.trim(),
    message: result.message.trim(),
    turnstileToken: result.turnstileToken.trim(),
  };
}

// ponytail: leave the handler pending; Task 3 owns verification, limiting, and delivery.
export function createContactHandler(_dependencies: ContactDependencies): ContactHandler {
  return async () =>
    Response.json({ error: "Contact handler is not implemented" }, { status: 501 });
}
