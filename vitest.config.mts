import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    // Mirrors the "@/*" path alias in tsconfig.json so tests import the same way
    // the app does.
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    // Pure logic only — no DOM needed, and node is faster to boot.
    environment: "node",
    include: ["lib/**/*.test.ts", "components/**/*.test.ts"],
  },
});
