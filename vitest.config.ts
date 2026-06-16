import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Unit + component tests for lib/ logic and the React layer. Runs under jsdom so
// the localStorage-backed helpers and rendered components work. Kept OUT of the
// Next build (tsconfig excludes tests/) so it can never affect the Pages deploy.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.{ts,tsx}"],
    setupFiles: ["tests/setup.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(process.cwd()) },
  },
});
