import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { launchElectron } from "./Helper"
import { createBasePage } from "./POM/BasePage"

import type { ElectronApplication } from "playwright"

let electronApp: ElectronApplication

beforeAll(async () => {
  electronApp = await launchElectron()
})

afterAll(async () => {
  await electronApp.close()
})

it("is possible to go to the settings page", async () => {
  const basePage = await createBasePage(electronApp)
  const tracksPage = await basePage.resetTo.tracks()

  const settingsPage = await tracksPage.goTo.settingsLibrary()

  await expect(settingsPage.waitToBeVisible()).resolves.toBeUndefined()
})

describe("From Settings", async () => {
  it("is possible to go to the tracks page", async () => {
    const basePage = await createBasePage(electronApp)
    const settingsPage = await basePage.resetTo.settingsLibrary()

    const tracksPage = await settingsPage.goTo.tracks()

    await expect(tracksPage.waitToBeVisible()).resolves.toBeUndefined()
  })
})
