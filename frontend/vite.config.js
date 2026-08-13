import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const TURNSTILE_TEST_SITE_KEY = "1x00000000000000000000AA";

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const turnstileSiteKey = env.VITE_TURNSTILE_SITE_KEY?.trim();
  if (
    command === "build" &&
    (!turnstileSiteKey || turnstileSiteKey === TURNSTILE_TEST_SITE_KEY)
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
