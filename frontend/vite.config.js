import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const CLOUDFLARE_TEST_TURNSTILE_SITE_KEYS = new Set([
  "1x00000000000000000000AA",
  "2x00000000000000000000AB",
  "1x00000000000000000000BB",
  "2x00000000000000000000BB",
  "3x00000000000000000000FF",
]);

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const turnstileSiteKey = env.VITE_TURNSTILE_SITE_KEY?.trim();
  if (
    command === "build" &&
    (!turnstileSiteKey || CLOUDFLARE_TEST_TURNSTILE_SITE_KEYS.has(turnstileSiteKey))
  ) {
    throw new Error(
      "VITE_TURNSTILE_SITE_KEY is required for production builds and must not be Cloudflare's test site key.",
    );
  }

  return {
    server: {
      allowedHosts: ["vesuvio3", "localhost"],
    },
    plugins: [react()],
  };
});
