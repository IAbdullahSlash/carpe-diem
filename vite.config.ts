import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";

// Baked into the bundle at build time; without them every page 500s with
// auth/invalid-api-key, so refuse to build instead of shipping a broken site.
const REQUIRED_ENV = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_APP_ID",
];

export default defineConfig(({ command, mode }) => {
  if (command === "build") {
    const env = loadEnv(mode, process.cwd(), "VITE_");
    const missing = REQUIRED_ENV.filter((key) => !env[key]);
    if (missing.length) {
      throw new Error(
        `Missing Firebase config: ${missing.join(", ")}. ` +
          "Add them to .env locally, or to the host's environment variables (e.g. Vercel → Settings → Environment Variables), then rebuild.",
      );
    }
  }

  return {
    // Nitro packages the server for the host it builds on (auto-detects Vercel).
    plugins: [tanstackStart(), nitro(), react(), tailwindcss()],
    resolve: {
      tsconfigPaths: true,
    },
  };
});
