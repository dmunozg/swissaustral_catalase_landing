import { describe, expect, test } from "bun:test";
import { ConfigError, loadConfig, type Environment } from "./config";

function environment(productionOrigin: string): Environment {
  return {
    NODE_ENV: "test",
    SMTP_HOST: "smtp.example.test",
    SMTP_USER: "smtp-user",
    SMTP_PASS: "smtp-pass",
    EMAIL_FROM: "website@example.test",
    EMAIL_REPORT_TO: "team@example.test",
    PRODUCTION_ORIGIN: productionOrigin,
  };
}

describe("configuration", () => {
  test.each(["custom://example.test/", "nothttps://example.test/"]) (
    "rejects non-HTTP(S) origin %s",
    (productionOrigin) => {
      expect(() => loadConfig(environment(productionOrigin))).toThrow(ConfigError);
    },
  );

  test.each(["http://example.test/", "https://example.test/"]) (
    "accepts %s",
    (productionOrigin) => {
      expect(loadConfig(environment(productionOrigin)).productionOrigin).toBe(
        productionOrigin.slice(0, -1),
      );
    },
  );

  test.each([undefined, "", "1x0000000000000000000000000000000AA"]) (
    "rejects the test Turnstile secret in production",
    (turnstileSecret) => {
      expect(() =>
        loadConfig({
          ...environment("https://example.test/"),
          PRODUCTION: "true",
          TURNSTILE_SECRET_KEY: turnstileSecret,
        }),
      ).toThrow(ConfigError);
    },
  );

  test("accepts a non-test Turnstile secret in production", () => {
    expect(
      loadConfig({
        ...environment("https://example.test/"),
        PRODUCTION: "true",
        TURNSTILE_SECRET_KEY: "production-secret",
      }).turnstileSecret,
    ).toBe("production-secret");
  });

  test.each([undefined, "", "1x0000000000000000000000000000000AA"])(
    "rejects a missing or test Turnstile secret when NODE_ENV is production",
    (turnstileSecret) => {
      expect(() =>
        loadConfig({
          ...environment("https://example.test/"),
          NODE_ENV: "production",
          TURNSTILE_SECRET_KEY: turnstileSecret,
        }),
      ).toThrow(ConfigError);
    },
  );

  test("accepts a non-test Turnstile secret when NODE_ENV is production", () => {
    expect(
      loadConfig({
        ...environment("https://example.test/"),
        NODE_ENV: "production",
        TURNSTILE_SECRET_KEY: "production-secret",
      }).turnstileSecret,
    ).toBe("production-secret");
  });

  test("uses the Turnstile test secret outside production", () => {
    expect(
      loadConfig(environment("https://example.test/")).turnstileSecret,
    ).toBe("1x0000000000000000000000000000000AA");
  });
});
