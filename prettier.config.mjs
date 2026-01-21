/** @type {import("@ianvs/prettier-plugin-sort-imports").PrettierConfig} */
export default {
  singleQuote: false,
  plugins: [
    "@ianvs/prettier-plugin-sort-imports",
  ],
  importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
  importOrderTypeScriptVersion: "5.9.3",
  importOrder: [
    "<BUILTIN_MODULES>",
    "^effect$",
    "^effect",
    "^@effect",
    "^react$",
    "^react",
    "^next$",
    "^next",
    "<THIRD_PARTY_MODULES>",
    "",
    "^(@packages)(/.*)$",
    "",
    "^@/",
    "",
    "^[../]",
    "",
    "^[./]",
  ],
};
