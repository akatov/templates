import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    typecheck: {
      include: ["*.test.ts?(x)"],
    },
    include: ["*.test.ts?(x)"],
  },
});
