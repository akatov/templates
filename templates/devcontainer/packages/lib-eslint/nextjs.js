import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// nextTs = tseslint.configs.recommended + 2 "unused" rules + nextjs ignores
// nextVitals = parser settings in eslint-config-next + next specific rules in @next/eslint-plugin-next

import baseConfig from "./base.js";

// nextVitals uses legacy eslint-plugin-import
const nenxtVitalsWithoutImport = nextVitals.map((config) => {
  if (config.plugins === undefined) {
    return config;
  }
  const pluginsWithoutImport = Object.fromEntries(
    Object.entries(config.plugins).filter(([name, _]) => name !== "import"),
  );
  const rulesWithoutImport = Object.fromEntries(
    Object.entries(config.rules ?? {}).filter(
      ([name, _]) => !name.startsWith("import/"),
    ),
  );
  const configWithoutImport = Object.assign(config, {
    plugins: pluginsWithoutImport,
    rules: rulesWithoutImport,
  });
  return configWithoutImport;
});

/**
 * A custom ESLint configuration for libraries that use Next.js.
 *
 * @type {Array<import("eslint").Linter.Config>}
 * */
const nextJsConfig = [
  ...nenxtVitalsWithoutImport,
  ...nextTs,
  ...baseConfig, // this uses newer eslint-plugin-import-x
];

export default nextJsConfig;
