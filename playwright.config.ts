import { defineConfig } from "@playwright/test"

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  testDir: "./tests/",

  workers: 1,

  use: {},
})
