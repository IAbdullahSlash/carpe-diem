import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";

export default defineConfig({
  // Nitro packages the server for the host it builds on (auto-detects Vercel).
  plugins: [tanstackStart(), nitro(), react(), tailwindcss()],
  resolve: {
    tsconfigPaths: true,
  },
});
