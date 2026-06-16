import { defineConfig } from "vitest/config";
import path from "node:path";

// Unit tests for the pure/localStorage logic in lib/. Runs under jsdom so the
// localStorage-backed helpers (settings, recents, session, lastVideo) work.
// Kept OUT of the Next build (tsconfig excludes tests/) so it can never affect
// the GitHub Pages deploy.
export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.ts"],
    setupFiles: ["tests/setup.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(process.cwd()) },
  },
});
