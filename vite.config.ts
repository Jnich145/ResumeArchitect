import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    {
      name: "development-csp",
      transformIndexHtml(html) {
        // Production permits no connections. Only the local dev server needs HMR.
        return command === "serve"
          ? html
              .replace("script-src 'self'", "script-src 'self' 'unsafe-inline'")
              .replace(
                "connect-src 'none'",
                "connect-src 'self' ws://127.0.0.1:* ws://localhost:*",
              )
          : html;
      },
    },
  ],
  test: { include: ["tests/**/*.test.ts"] },
}));
