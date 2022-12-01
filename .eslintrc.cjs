const defaultRules = {
  "@typescript-eslint/ban-ts-comment": "off",
  "import/named": "off",
  "@typescript-eslint/no-explicit-any": [
    "error",
    {
      ignoreRestArgs: true,
    },
  ],
  "@typescript-eslint/no-misused-promises": "off",
  "@typescript-eslint/no-shadow": [
    "error",
    {
      ignoreTypeValueShadow: true,
    },
  ],
  "@typescript-eslint/no-unused-vars": [
    "error",
    {
      argsIgnorePattern: "^_",
      destructuredArrayIgnorePattern: "^_",
      varsIgnorePattern: "^_+$",
    },
  ],
  "@typescript-eslint/no-use-before-define": "off",
  "arrow-body-style": ["error", "as-needed"],
  "func-style": ["error", "declaration"],
  "import/extensions": "off",
  "import/no-default-export": "error",
  "import/no-extraneous-dependencies": [
    "error",
    {
      devDependencies: true,
    },
  ],
  "import/no-unresolved": "off",
  "import/order": [
    "error",
    {
      groups: [
        "builtin",
        "external",
        "parent",
        "sibling",
        "index",
        "object",
        "type",
      ],
      "newlines-between": "always",
      pathGroups: [
        {
          group: "parent",
          pattern: "@/**/*.svelte",
          position: "after",
        },
        {
          group: "parent",
          pattern: "@/**",
          position: "before",
        },
        {
          group: "external",
          pattern: "@sing*/**",
          position: "after",
        },
      ],
      pathGroupsExcludedImportTypes: ["type"],
    },
  ],
  "import/prefer-default-export": "off",
  "no-console": "off",
  "no-restricted-syntax": "off",
  "no-shadow": "off",
  "no-underscore-dangle": "off",
  "no-unused-vars": "off",
  "no-use-before-define": "off",
  "spaced-comment": [
    "error",
    "always",
    {
      markers: ["/", "?", "!"],
    },
  ],
  "svelte/valid-compile": "off",
  "unicorn/filename-case": "off",
  "unicorn/no-array-callback-reference": "off",
  "unicorn/no-array-reduce": "off",
  "unicorn/no-useless-undefined": "off",
  "unicorn/prefer-module": "off",
  "unicorn/prefer-top-level-await": "off",
  "unicorn/prevent-abbreviations": [
    "error",
    {
      ignore: ["\\.e2e$"],
    },
  ],
}

module.exports = {
  env: {
    browser: false,
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    /** @see https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin#recommended-configs */
    "plugin:import/typescript",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:unicorn/recommended",
    "plugin:svelte/prettier",
    "plugin:svelte/recommended",
    "prettier",
  ],
  ignorePatterns: ["node_modules/**", "**/dist/**"],
  overrides: [
    {
      env: {
        browser: true,
        es6: true,
        node: true,
      },
      extends: [
        "eslint:recommended",
        "plugin:import/recommended",
        "plugin:unicorn/recommended",
        "prettier",
      ],
      files: ["**/*.js"],
      parser: "Espree",
      parserOptions: {
        ecmaVersion: 12,
      },
      plugins: [],
      rules: defaultRules,
    },
    {
      env: {
        browser: true,
        es6: true,
        node: false,
      },

      /** @see https://github.com/ota-meshi/eslint-plugin-svelte */
      files: ["*.svelte"],
      parser: "svelte-eslint-parser",
      parserOptions: {
        parser: "@typescript-eslint/parser",
      },
    },
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      classes: false, // Use factory functions instead.
    },
    ecmaVersion: 12,
    extraFileExtensions: [".svelte"],
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "import"],
  root: true,
  rules: {
    ...defaultRules,
    "@typescript-eslint/consistent-type-imports": "error",
    "@typescript-eslint/no-var-requires": "off",
  },
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import/resolver": {
      node: true,
      // See https://github.com/import-js/eslint-import-resolver-typescript#configuration
      typescript: {
        alwaysTryTypes: false,
        // use an array of glob patterns
        project: ["packages/*/tsconfig.json"],
      },
    },
  },
}
