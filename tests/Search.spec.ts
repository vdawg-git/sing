import { expect, test } from "@playwright/test"

import { UNKNOWN_ALBUM, UNKNOWN_ARTIST } from "@sing-shared/Consts"

import type { ElectronApplication } from "playwright"

import { launchElectron } from "#/Helper"
import { createBasePage } from "#pages/BasePage"

let electronApp: ElectronApplication

test.beforeAll(async () => {
  electronApp = await launchElectron()
  const basePage = await createBasePage(electronApp)
  const settingsPage = await basePage.resetTo.settingsLibrary()

  await settingsPage.addDefaultFolders()
  await settingsPage.saveAndSyncFolders()
})

test.afterAll(async () => {
  await electronApp.close()
})

test.beforeEach(async () => {
  const basePage = await createBasePage(electronApp)
  await basePage.reload()
})

test("should display the correct search result", async () => {
  const basePage = await createBasePage(electronApp)

  const expectedTitle = "01"

  await basePage.searchbar.searchTitle(expectedTitle)

  const resultTitle = await basePage.searchbar
    .getFirstResult()
    .then((result) => result && result.getData())
    .then((result) => result?.title)

  expect(resultTitle).toBe(expectedTitle)
})

test.describe("navigation", async () => {
  test("should navigate to the artist of a found track", async () => {
    const basePage = await createBasePage(electronApp)

    const expectedTitle = "01"

    await basePage.searchbar.searchTitle(expectedTitle)
    const result = await basePage.searchbar.getFirstResult()

    if (result === undefined) throw new Error("Could not find a search result")

    const artistPage = await result.goTo.artist()

    const artistName = await artistPage.heading.getTitle()

    expect(artistName).toEqual(UNKNOWN_ARTIST)
  })

  test("should navigate to the album of a found track", async () => {
    const basePage = await createBasePage(electronApp)

    const expectedTitle = "01"

    await basePage.searchbar.searchTitle(expectedTitle)
    const result = await basePage.searchbar.getFirstResult()

    if (result === undefined) throw new Error("Could not find a search result")

    const albumName = await result.goTo
      .album()
      .then((albumPage) => albumPage.heading.getTitle())

    expect(albumName).toEqual(UNKNOWN_ALBUM)
  })
})
