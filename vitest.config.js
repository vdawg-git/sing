import { resolve } from "node:path"

/**
 * Config for global end-to-end tests
 * placed in project root tests folder
 * @type {import('vite').UserConfig}
 * @see https://vitest.dev/config/
 */
const config = {
  resolve: {
    alias: {
      "@": `${resolve("tests")}/`,
      "@sing-types": `${resolve("types")}/`,
      "@sing-main": `${resolve("packages", "main", "src")}/`,
      "@sing-renderer": `${resolve("packages", "renderer", "src")}/`,
      "@sing-shared": `${resolve("shared")}/`,
    },
  },
  test: {
    include: ["./tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],

    /**
     * A default timeout of 5000ms is sometimes not enough for playwright.
     *
     * This one is generally too high, but instead set the timeouts in the Playwright methods instead.
     */
    testTimeout: 60_000,
    hookTimeout: 30_000,

    maxThreads: 1,
    minThreads: 1,

    test: {
      reporters: ["default", "html"],
      outputFile: "./test_results.html",
    },
  },
}

// eslint-disable-next-line import/no-default-export
export default config
