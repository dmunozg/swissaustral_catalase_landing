import assert from "node:assert/strict";
import { test } from "node:test";
import { trackGenerateLead } from "./google-tag.js";

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

test("does nothing when the GTM data layer is unavailable", () => {
  withWindow({}, () => {
    assert.doesNotThrow(() => trackGenerateLead());
  });
});
