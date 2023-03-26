import { defineConfig } from "@playwright/test"

process.env.NODE_ENV = "testing"

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  testDir: "./tests/",

  workers: 1,

  use: {},
})
