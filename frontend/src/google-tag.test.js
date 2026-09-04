import assert from "node:assert/strict";
import { test } from "node:test";
import { trackGenerateLead, trackWhatsAppClick } from "./google-tag.js";

function withWindow(window, callback) {
  const previousWindow = globalThis.window;
  globalThis.window = window;
  try {
    callback();
  } finally {
    globalThis.window = previousWindow;
  }
}

test("queues the generate_lead event without form data", () => {
  const fakeWindow = { dataLayer: [] };

  withWindow(fakeWindow, () => {
    trackGenerateLead();
  });

  assert.deepEqual(fakeWindow.dataLayer, [{ event: "generate_lead" }]);
});

test("queues the WhatsApp click event", () => {
  const fakeWindow = { dataLayer: [] };

  withWindow(fakeWindow, () => {
    trackWhatsAppClick();
  });

  assert.deepEqual(fakeWindow.dataLayer, [{ event: "whatsapp_click" }]);
});

test("does nothing when the GTM data layer is unavailable", () => {
  withWindow({}, () => {
    assert.doesNotThrow(() => trackGenerateLead());
    assert.doesNotThrow(() => trackWhatsAppClick());
  });
});
