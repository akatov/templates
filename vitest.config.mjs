import { defineConfig } from "vitest/config";

const include = ["*.test.ts?(x)", "src/**/*.test.ts?(x)"];

export default defineConfig({
  test: {
    globals: true,
    typecheck: {
      include,
    },
    include,
  },
});
