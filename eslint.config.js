const globals = require("globals");

/** @type {import("eslint").Linter.FlatConfig[]} */
module.exports = [
  {
    files: ["**/*.js"],
    ignores: ["node_modules/**", "data/**"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        ...globals.node
      }
    },
    rules: {
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "no-undef": "error",
      "eqeqeq": ["error", "always"],
      "curly": ["error", "all"]
    }
  }
];
