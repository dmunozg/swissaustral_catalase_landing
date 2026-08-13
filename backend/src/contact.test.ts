import { describe, expect, test } from "bun:test";
import type { AppConfig } from "./config";
import {
  createContactHandler,
  type ContactMail,
  type ContactPayload,
} from "./contact";

const config: AppConfig = {
  nodeEnv: "test",
  port: 3000,
  smtpHost: "smtp.example.test",
  smtpPort: 587,
  smtpUser: "smtp-user",
  smtpPass: "smtp-pass",
  emailFrom: "website@example.test",
  emailReportTo: "team@example.test",
  productionOrigin: "https://example.test",
  turnstileSecret: "turnstile-secret",
  turnstileExpectedHostname: "example.test",
  trustProxy: false,
  rateLimitMax: 2,
  rateLimitWindowMs: 60_000,
};

const payload: ContactPayload = {
  name: "Ada Lovelace",
  email: "ada@example.test",
  message: "Please send more information.",
  turnstileToken: "turnstile-token",
};

function request(body: unknown = payload, origin = config.productionOrigin): Request {
  return new Request("https://example.test/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
    },
    body: JSON.stringify(body),
  });
}

function seams(overrides: Partial<{
  verifyTurnstile: (token: string, request: Request) => Promise<boolean>;
  sendMail: (mail: ContactMail) => Promise<void>;
}> = {}) {
  const sent: ContactMail[] = [];
  let verified = 0;
  const handler = createContactHandler({
    config,
    verifyTurnstile: async (token, currentRequest) => {
      verified += 1;
      return overrides.verifyTurnstile?.(token, currentRequest) ?? true;
    },
    sendMail: async (mail) => {
      sent.push(mail);
      await overrides.sendMail?.(mail);
    },
    now: () => 1_000,
    clientKey: () => "198.51.100.10",
  });
  return { handler, sent, get verified() { return verified; } };
}

describe("contact contract", () => {
  test("accepts a valid payload and sends a receipt plus report", async () => {
    const testSeams = seams();

    const response = await testSeams.handler(request());

    expect(response.status).toBe(200);
    expect(response.headers.get("access-control-allow-origin")).toBe(
      config.productionOrigin,
    );
    expect(testSeams.verified).toBe(1);
    expect(testSeams.sent.map(({ kind }) => kind)).toEqual(["receipt", "report"]);
  });

  test("rejects invalid bounded payloads before Turnstile or mail", async () => {
    const testSeams = seams();
    const invalid = { ...payload, message: "x".repeat(5_001) };

    const response = await testSeams.handler(request(invalid));

    expect(response.status).toBe(400);
    expect(testSeams.verified).toBe(0);
    expect(testSeams.sent).toHaveLength(0);
  });

  test("rejects a failed Turnstile verification without mail", async () => {
    const testSeams = seams({ verifyTurnstile: async () => false });

    const response = await testSeams.handler(request());

    expect(response.status).toBe(403);
    expect(response.headers.get("access-control-allow-origin")).toBe(
      config.productionOrigin,
    );
    expect(testSeams.sent).toHaveLength(0);
  });

  test("rejects a request from a different origin before verification", async () => {
    const testSeams = seams();

    const response = await testSeams.handler(request(payload, "https://evil.example"));

    expect(response.status).toBe(403);
    expect(response.headers.get("access-control-allow-origin")).toBeNull();
    expect(testSeams.verified).toBe(0);
    expect(testSeams.sent).toHaveLength(0);
  });

  test("limits repeated submissions from one client", async () => {
    const testSeams = seams();

    const responses = await Promise.all([
      testSeams.handler(request()),
      testSeams.handler(request()),
      testSeams.handler(request()),
    ]);

    expect(responses.map(({ status }) => status)).toEqual([200, 200, 429]);
  });

  test("allows a client to submit again after its rate-limit window expires", async () => {
    let currentTime = 1_000;
    const testSeams = createContactHandler({
      config,
      verifyTurnstile: async () => true,
      sendMail: async () => {},
      now: () => currentTime,
      clientKey: (currentRequest) => currentRequest.headers.get("x-client") ?? "unknown",
    });

    const clientRequest = () => new Request("https://example.test/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: config.productionOrigin,
        "X-Client": "expired-client",
      },
      body: JSON.stringify(payload),
    });

    expect((await testSeams(clientRequest())).status).toBe(200);
    expect((await testSeams(clientRequest())).status).toBe(200);
    expect((await testSeams(clientRequest())).status).toBe(429);

    currentTime += config.rateLimitWindowMs + 1;
    expect((await testSeams(clientRequest())).status).toBe(200);
  });
});
