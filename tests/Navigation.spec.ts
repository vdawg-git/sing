import type { ElectronApplication } from "playwright"
import { afterAll, beforeAll, expect, it } from "vitest"
import createBasePage from "./POM/Base"
import { launchElectron } from "./Helper"

let electronApp: ElectronApplication

beforeAll(async () => {
  electronApp = await launchElectron()
})

afterAll(async () => {
  await electronApp.close()
})

it("is possible to go to the settings page", async () => {
  const page = await electronApp.firstWindow()
  const basePage = createBasePage(page)
  const tracksPage = await basePage.resetTo("tracks")

  const settingsPage = await tracksPage.goTo.settings()

  expect(await settingsPage.isDisplayed()).toBe(true)
})
