import { beforeEach, afterAll, beforeAll, describe, expect, it } from "vitest"

import { UNKNOWN_ALBUM, UNKNOWN_ARTIST } from "../packages/shared/Consts"

import { launchElectron } from "./Helper"
import { createBasePage } from "./POM/BasePage"

import type { ElectronApplication } from "playwright"

let electronApp: ElectronApplication

beforeAll(async () => {
  electronApp = await launchElectron()
  const basePage = await createBasePage(electronApp)
  const settingsPage = await basePage.resetTo.settingsLibrary()

  await settingsPage.setDefaultFolders()
  await settingsPage.saveAndSyncFolders()
})

afterAll(async () => {
  await electronApp.close()
})

beforeEach(async () => {
  const basePage = await createBasePage(electronApp)
  await basePage.reload()
})

it("should display the correct search result", async () => {
  const basePage = await createBasePage(electronApp)

  const expectedTitle = "01"

  await basePage.searchbar.searchTitle(expectedTitle)

  const resultTitle = await basePage.searchbar
    .getFirstResult()
    .then((result) => result && result.getData())
    .then((result) => result?.title)

  expect(resultTitle).toBe(expectedTitle)
})

describe("navigation", async () => {
  it("should navigate to the artist of a found track", async () => {
    const basePage = await createBasePage(electronApp)

    const expectedTitle = "01"

    await basePage.searchbar.searchTitle(expectedTitle)
    const result = await basePage.searchbar.getFirstResult()

    if (result === undefined) throw new Error("Could not find a search result")

    const artistPage = await result.goTo.artist()

    const artistName = await artistPage.heading.getTitle()

    expect(artistName).toEqual(UNKNOWN_ARTIST)
  })

  it("should navigate to the album of a found track", async () => {
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
