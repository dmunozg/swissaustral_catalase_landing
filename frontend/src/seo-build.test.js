import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const html = readFileSync(new URL("../dist/index.html", import.meta.url), "utf8");
const title = "Cold-Active Catalase for Biosensors | Swissaustral";
const description =
  "Swissaustral Cold-Active Catalase for oxidase-based biosensors: manage hydrogen peroxide, recover oxygen, and evaluate sensor performance.";
const canonical = "https://swissaustral.com/biosensors/";
const shareImage =
  "https://swissaustral.com/biosensors/assets/patagonia-hero-v2.jpg";

function assertMeta(attribute, value) {
  const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  assert.match(
    html,
    new RegExp(
      `<meta\\s+(?:name|property)="${attribute}"\\s+content="${escapedValue}"`,
    ),
  );
}

test("built root contains crawlable landing-page content", () => {
  const root = html.match(/<div id="root">([\s\S]*?)<\/div>\s*<\/body>/)?.[1];

  assert.ok(root, "built HTML should contain the rendered root");
  assert.match(
    root,
    /<h1[^>]*>\s*Your oxidase sensor may be running out of room\.\s*<\/h1>/,
  );
});

test("built HTML contains the SEO metadata contract", () => {
  assert.ok(html.includes(`<title>${title}</title>`));
  assert.ok(html.includes(`<link rel="canonical" href="${canonical}"`));
  assertMeta("description", description);

  assertMeta("og:type", "website");
  assertMeta("og:url", canonical);
  assertMeta("og:title", title);
  assertMeta("og:description", description);
  assertMeta("og:image", shareImage);

  assertMeta("twitter:card", "summary_large_image");
  assertMeta("twitter:title", title);
  assertMeta("twitter:description", description);
  assertMeta("twitter:image", shareImage);

  assert.match(html, /<link rel="icon" href="\/biosensors\/favicon\.png"/);

  const jsonLd = html.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
  )?.[1];
  assert.ok(jsonLd, "built HTML should contain JSON-LD");
  const graph = JSON.parse(jsonLd)["@graph"];
  assert.ok(Array.isArray(graph));
  assert.deepEqual(
    new Set(graph.map((entry) => entry["@type"])),
    new Set(["Organization", "WebPage", "Product"]),
  );
});

test("built HTML contains the configured Google Tag Manager snippets", () => {
  assert.match(
    html,
    /<head>\s*<!-- Google Tag Manager -->[\s\S]*?googletagmanager\.com\/gtm\.js\?id=[\s\S]*?GTM-TEST123/,
  );
  assert.match(
    html,
    /<body>\s*<!-- Google Tag Manager \(noscript\) -->\s*<noscript><iframe src="https:\/\/www\.googletagmanager\.com\/ns\.html\?id=GTM-TEST123"/,
  );
  assert.doesNotMatch(html, /googletagmanager\.com\/gtag\/js/);
});

test("built HTML contains the configured WhatsApp chat link", () => {
  assert.match(
    html,
    /<a\b[^>]*class="whatsapp-fab"[^>]*href="https:\/\/wa\.me\/41790000000\?text=Hello%2C%20I%20am%20interested%20in%20Cold-Active%20Catalase\."[^>]*target="_blank"[^>]*rel="noopener noreferrer"[^>]*aria-label="Chat with us on WhatsApp"/,
  );
});

test("built HTML contains exactly the two external Swissaustral logo links", () => {
  const logoLinks = [
    ...html.matchAll(
      /<a\b[^>]*href="https:\/\/www\.swissaustral\.com"[^>]*>[\s\S]*?<\/a>/g,
    ),
  ];

  assert.equal(logoLinks.length, 2);
  for (const [link] of logoLinks) {
    assert.match(link, /<img\b[^>]*alt="Swissaustral"/);
  }
});
