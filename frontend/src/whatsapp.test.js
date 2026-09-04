import assert from "node:assert/strict";
import { test } from "node:test";
import { buildWhatsAppHref } from "./whatsapp.js";

test("builds a WhatsApp URL with an encoded opening message", () => {
  assert.equal(
    buildWhatsAppHref("41790000000", "Hello, I'm interested in Cold-Active Catalase."),
    "https://wa.me/41790000000?text=Hello%2C%20I'm%20interested%20in%20Cold-Active%20Catalase.",
  );
});

test("accepts the minimum and maximum international phone number lengths", () => {
  assert.match(buildWhatsAppHref("1234567", "Hello"), /^https:\/\/wa\.me\/1234567\?/);
  assert.match(
    buildWhatsAppHref("123456789012345", "Hello"),
    /^https:\/\/wa\.me\/123456789012345\?/,
  );
});

test("rejects missing, malformed, and out-of-range phone numbers", () => {
  for (const phone of ["", "123456", "1234567890123456", "+41790000000", "41 790 000 00"]) {
    assert.equal(buildWhatsAppHref(phone, "Hello"), "");
  }
});
