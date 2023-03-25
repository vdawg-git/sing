import { expect, test } from "@playwright/test"

import type { ElectronApplication } from "playwright"

import { launchElectron } from "#/Helper"
import { createBasePage } from "#pages/BasePage"

let electronApp: ElectronApplication

test.beforeAll(async () => {
  electronApp = await launchElectron()
})

test.afterAll(async () => {
  await electronApp.close()
})

test("is possible to go to the settings page", async () => {
  const basePage = await createBasePage(electronApp)
  const tracksPage = await basePage.resetTo.tracks()

  const settingsPage = await tracksPage.goTo.settingsLibrary()

  await expect(settingsPage.foldersWrapper).toBeVisible()
})

test.describe("From Settings", async () => {
  test("is possible to go to the tracks page", async () => {
    const basePage = await createBasePage(electronApp)
    const settingsPage = await basePage.resetTo.settingsLibrary()

    const tracksPage = await settingsPage.goTo.tracks()

    await tracksPage.waitToBeVisible()
  })
})
