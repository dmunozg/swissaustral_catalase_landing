import assert from "node:assert/strict";
import { test } from "node:test";
import { initializeGoogleTag, trackGenerateLead } from "./google-tag.js";

function withBrowserGlobals(window, document, callback) {
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  globalThis.window = window;
  globalThis.document = document;
  try {
    callback();
  } finally {
    globalThis.window = previousWindow;
    globalThis.document = previousDocument;
  }
}

test("does not touch browser globals without a tag ID", () => {
  let createElementCalls = 0;
  const fakeWindow = {};
  const fakeDocument = {
    createElement() {
      createElementCalls += 1;
    },
    head: { appendChild() {} },
  };

  withBrowserGlobals(fakeWindow, fakeDocument, () => {
    assert.equal(initializeGoogleTag("  \t"), false);
  });

  assert.deepEqual(fakeWindow, {});
  assert.equal(createElementCalls, 0);
});

test("initializes the configured tag and queues its commands", () => {
  const scripts = [];
  const fakeWindow = {};
  const fakeDocument = {
    createElement(tagName) {
      assert.equal(tagName, "script");
      return {};
    },
    head: { appendChild: (script) => scripts.push(script) },
  };

  withBrowserGlobals(fakeWindow, fakeDocument, () => {
    assert.equal(initializeGoogleTag(" G-TEST123456 "), true);
  });

  assert.equal(scripts.length, 1);
  assert.equal(
    scripts[0].src,
    "https://www.googletagmanager.com/gtag/js?id=G-TEST123456",
  );
  assert.equal(scripts[0].async, true);
  assert.equal(fakeWindow.dataLayer.length, 2);
  assert.equal(fakeWindow.dataLayer[0][0], "js");
  assert.ok(fakeWindow.dataLayer[0][1] instanceof Date);
  assert.deepEqual([...fakeWindow.dataLayer[1]], ["config", "G-TEST123456"]);
});

test("queues the generate_lead event without form data", () => {
  const fakeWindow = {};
  const fakeDocument = {
    createElement: () => ({}),
    head: { appendChild() {} },
  };

  withBrowserGlobals(fakeWindow, fakeDocument, () => {
    initializeGoogleTag("G-TEST123456");
    trackGenerateLead();
  });

  assert.equal(fakeWindow.dataLayer.length, 3);
  assert.deepEqual([...fakeWindow.dataLayer[2]], ["event", "generate_lead"]);
});
