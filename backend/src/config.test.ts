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
});
