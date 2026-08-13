import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  server:{
    allowedHosts: [
      'vesuvio3',
      'localhost'
    ]
  },
  plugins: [react()],
});
