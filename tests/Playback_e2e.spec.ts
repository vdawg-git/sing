import type { ElectronApplication } from "playwright"
import { _electron as electron } from "playwright"
import { afterAll, beforeAll, describe, expect, it, test } from "vitest"
import { createHash } from "crypto"
import "../packages/preload/contracts.d.ts"

let electronApp: ElectronApplication

beforeAll(async () => {
  electronApp = await electron.launch({ args: ["."] })
})

afterAll(async () => {
  await electronApp.close()
})


it("progresses the seekbar", async () => {
  
})


it.todo("goes to the next track in queue after the current has finished", async () => {

})

test.todo("Main window web content", async () => {
  const page = await electronApp.firstWindow()
  const element = await page.$("#app", { strict: true })
})
