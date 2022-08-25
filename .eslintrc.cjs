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
  "import/no-unresolved": "off",
  "import/order": "off",
  "unicorn/prefer-module": "off",
  "no-use-before-define": "off",
  "unicorn/no-array-callback-reference": "off",
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
      varsIgnorePattern: "^_$",
    },
  ],
  "spaced-comment": ["error", "always", { markers: ["/", "?", "!"] }],
  "no-underscore-dangle": "off",
  "@typescript-eslint/no-explicit-any": ["error", { ignoreRestArgs: true }],
  "no-shadow": "off",
  "@typescript-eslint/no-shadow": ["error", { ignoreTypeValueShadow: true }],
  "func-style": ["error", "declaration"],
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
    "airbnb-base",
    /** @see https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin#recommended-configs */
    "plugin:@typescript-eslint/recommended",
    "plugin:unicorn/recommended",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
    ecmaFeatures: {
      classes: false,
    },
  },
  plugins: ["@typescript-eslint"],
  ignorePatterns: ["node_modules/**", "**/dist/**"],
  rules: {
    ...defaultRules,
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/consistent-type-imports": "error",
  },
  overrides: [
    {
      files: ["**/*.js"],
      env: { browser: true, es6: true, node: true },
      extends: [
        "eslint:recommended",
        "airbnb-base",
        "plugin:unicorn/recommended",
        "prettier",
      ],
      parser: "Espree",
      plugins: [],
      parserOptions: {
        ecmaVersion: 12,
      },
      rules: {
        ...defaultRules,
      },
    },
  ],
}
