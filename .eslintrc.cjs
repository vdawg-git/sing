const defaultRules = {
  "no-console": "off",
  "import/no-extraneous-dependencies": [
    "error",
    {
      devDependencies: true,
    },
  ],
  "import/prefer-default-export": "off",
  "unicorn/filename-case": "off",
  "import/extensions": "off",
  "@typescript-eslint/no-misused-promises": "off",
  "@typescript-eslint/ban-ts-comment": "off",
  "@typescript-eslint/no-use-before-define": "off",
  "no-restricted-syntax": "off",
  "unicorn/prefer-module": "off",
  "no-use-before-define": "off",
  "unicorn/no-array-callback-reference": "off",
  "import/no-default-export": "error",
  "svelte/valid-compile": "off",
  "unicorn/no-useless-undefined": "off",
  "unicorn/prefer-top-level-await": "off",
  "unicorn/prevent-abbreviations": [
    "error",
    {
      ignore: ["\\.e2e$"],
    },
  ],
  "no-unused-vars": "off",
  "@typescript-eslint/no-unused-vars": [
    "error",
    {
      argsIgnorePattern: "^_",
      destructuredArrayIgnorePattern: "^_",
      varsIgnorePattern: "^_+$",
    },
  ],
  "spaced-comment": ["error", "always", { markers: ["/", "?", "!"] }],
  "no-underscore-dangle": "off",
  "@typescript-eslint/no-explicit-any": ["error", { ignoreRestArgs: true }],
  "no-shadow": "off",
  "@typescript-eslint/no-shadow": ["error", { ignoreTypeValueShadow: true }],
  "func-style": ["error", "declaration"],
  "import/no-unresolved": "off", // TS checks that enough and for virtual: imports this does not apply anyway.
  "import/order": [
    "error",
    {
      "newlines-between": "always",
      groups: [
        "builtin",
        "external",
        "parent",
        "sibling",
        "index",
        "object",
        "type",
      ],
      pathGroups: [
        { pattern: "@/**/*.svelte", group: "parent", position: "after" },
        { pattern: "@/**", group: "parent", position: "before" },
        { pattern: "@sing*/**", group: "external", position: "after" },
      ],
    },
  ],
}

module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
    browser: false,
  },

  extends: [
    "eslint:recommended",
    /** @see https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin#recommended-configs */
    "plugin:@typescript-eslint/recommended",
    "plugin:unicorn/recommended",
    "prettier",
    "plugin:svelte/recommended",
    "plugin:svelte/prettier",
    "plugin:import/recommended",
    "plugin:import/typescript",
  ],

  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
    ecmaFeatures: {
      classes: false, // Use factory functions instead.
    },
    extraFileExtensions: [".svelte"],
  },

  plugins: ["@typescript-eslint", "import"],
  ignorePatterns: ["node_modules/**", "**/dist/**"],

  rules: {
    ...defaultRules,
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/consistent-type-imports": "error",
  },

  settings: {
    "import/resolver": {
      // See https://github.com/import-js/eslint-import-resolver-typescript#configuration
      typescript: {
        alwaysTryTypes: false,

        // use an array of glob patterns
        project: ["packages/*/tsconfig.json"],
      },

      node: true,
    },
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
  },

  overrides: [
    {
      files: ["**/*.js"],
      env: { browser: true, es6: true, node: true },
      extends: [
        "eslint:recommended",
        "plugin:import/recommended",
        "plugin:unicorn/recommended",
        "prettier",
      ],
      parser: "Espree",
      plugins: [],
      parserOptions: { ecmaVersion: 12 },
      rules: defaultRules,
    },
    {
      /** @see https://github.com/ota-meshi/eslint-plugin-svelte */
      files: ["*.svelte"],
      env: { browser: true, es6: true, node: false },
      parser: "svelte-eslint-parser",
      parserOptions: {
        parser: "@typescript-eslint/parser",
      },
    },
  ],
}
