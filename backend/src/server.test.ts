import { describe, expect, test } from "bun:test";
import {
  CLOUDFLARE_TEST_TURNSTILE_SECRET,
  type AppConfig,
} from "./config";
import { isTurnstileResponseValid } from "./turnstile";

const testConfig: Pick<
  AppConfig,
  "turnstileSecret" | "turnstileExpectedHostname"
> = {
  turnstileSecret: CLOUDFLARE_TEST_TURNSTILE_SECRET,
  turnstileExpectedHostname: "contact.example.test",
};

const realConfig = {
  ...testConfig,
  turnstileSecret: "real-secret",
};

describe("Turnstile response validation", () => {
  test("accepts a successful response with the Cloudflare test secret", () => {
    expect(
      isTurnstileResponseValid({ success: true, hostname: "example.com" }, testConfig),
    ).toBe(true);
  });

  test.each([
    { success: true, hostname: "contact.example.test" },
    { success: true, action: "other", hostname: "contact.example.test" },
    { success: true, action: "contact" },
    { success: true, action: "contact", hostname: "other.example.test" },
  ])("rejects a real secret response without the expected action and hostname: %j", (result) => {
    expect(isTurnstileResponseValid(result, realConfig)).toBe(false);
  });
});
