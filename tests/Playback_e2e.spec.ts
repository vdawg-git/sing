import type { ElectronApplication } from "playwright"
import { _electron as electron } from "playwright"
import { afterAll, beforeAll, expect, test } from "vitest"
import { createHash } from "crypto"
import "../packages/preload/contracts.d.ts"

let electronApp: ElectronApplication

beforeAll(async () => {
  electronApp = await electron.launch({ args: ["."] })
})

afterAll(async () => {
  await electronApp.close()
})

test.todo("Main window web content", async () => {
  const page = await electronApp.firstWindow()
  const element = await page.$("#app", { strict: true })
})
