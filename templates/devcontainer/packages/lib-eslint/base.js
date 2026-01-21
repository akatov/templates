import { tanstackConfig } from "@tanstack/eslint-config";
import eslintConfigPrettier from "eslint-config-prettier";
import onlyWarn from "eslint-plugin-only-warn";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {Array<import("eslint").Linter.Config>}
 */
const baseConfig = [
  ...tanstackConfig.map((config) =>
    config.name === "tanstack/javascript"
      ? {
          ...config,
          rules: {
            ...config.rules,
            // javascriptRules overrides
            "no-shadow": "off",
            "sort-imports": "off", // handled by prettier
            // typescriptRules overrides
            "@typescript-eslint/consistent-type-imports": "off", // inconvenient for effect
            "@typescript-eslint/no-unused-vars": [
              "warn",
              {
                args: "all",
                argsIgnorePattern: "^_",
                caughtErrors: "all",
                caughtErrorsIgnorePattern: "^_",
                destructuredArrayIgnorePattern: "^_",
                varsIgnorePattern: "^_",
                ignoreRestSiblings: true,
              },
            ],
            // importRules overrides
            "import/consistent-type-specifier-style": "off", // handled by prettier
            "import/order": "off", // handled by prettier
          },
        }
      : config,
  ),
  {
    ...pluginReact.configs.flat.recommended,
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
      },
    },
  },
  {
    plugins: {
      "react-hooks": pluginReactHooks,
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      // React scope no longer necessary with new JSX transform.
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  },
  eslintConfigPrettier,
  {
    plugins: {
      onlyWarn,
    },
  },
];

export default baseConfig;
