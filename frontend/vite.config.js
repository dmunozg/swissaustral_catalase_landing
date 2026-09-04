import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const CLOUDFLARE_TEST_TURNSTILE_SITE_KEYS = new Set([
  "1x00000000000000000000AA",
  "2x00000000000000000000AB",
  "1x00000000000000000000BB",
  "2x00000000000000000000BB",
  "3x00000000000000000000FF",
]);

function googleTagManagerPlugin(containerId) {
  return {
    name: "google-tag-manager",
    transformIndexHtml(html) {
      if (!containerId) {
        return html;
      }

      const headSnippet = `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${containerId}');</script>
<!-- End Google Tag Manager -->`;
      const bodySnippet = `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${containerId}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`;

      return html
        .replace("<head>", `<head>\n    ${headSnippet}`)
        .replace("<body>", `<body>\n    ${bodySnippet}`);
    },
  };
}

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const turnstileSiteKey = env.VITE_TURNSTILE_SITE_KEY?.trim();
  const googleTagManagerId = env.VITE_GOOGLE_TAG_MANAGER_ID?.trim();
  const whatsAppPhoneRaw = env.VITE_WHATSAPP_PHONE;
  const whatsAppPhone = whatsAppPhoneRaw?.trim();
  const whatsAppMessage = env.VITE_WHATSAPP_MESSAGE?.trim();
  if (
    command === "build" &&
    (!turnstileSiteKey || CLOUDFLARE_TEST_TURNSTILE_SITE_KEYS.has(turnstileSiteKey))
  ) {
    throw new Error(
      "VITE_TURNSTILE_SITE_KEY is required for production builds and must not be Cloudflare's test site key.",
    );
  }
  if (googleTagManagerId && !/^GTM-[A-Z0-9]+$/.test(googleTagManagerId)) {
    throw new Error(
      "VITE_GOOGLE_TAG_MANAGER_ID must match GTM-[A-Z0-9]+ when configured.",
    );
  }
  if (command === "build" && !googleTagManagerId) {
    throw new Error(
      "VITE_GOOGLE_TAG_MANAGER_ID is required for production builds.",
    );
  }
  if (command === "build" && !whatsAppPhone) {
    throw new Error("VITE_WHATSAPP_PHONE is required for production builds.");
  }
  if (whatsAppPhone && !/^[0-9]{7,15}$/.test(whatsAppPhoneRaw)) {
    throw new Error(
      "VITE_WHATSAPP_PHONE must consist of 7 to 15 digits, including the country code, with no spaces or other characters.",
    );
  }
  if (command === "build" && !whatsAppMessage) {
    throw new Error("VITE_WHATSAPP_MESSAGE is required for production builds.");
  }

  return {
    base: command === "build" ? "/biosensors/" : "/",
    server: {
      allowedHosts: ["vesuvio3", "localhost"],
    },
    plugins: [googleTagManagerPlugin(googleTagManagerId), react()],
  };
});
