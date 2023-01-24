import { beforeEach, afterAll, beforeAll, describe, expect, it } from "vitest"

import { UNKNOWN_ALBUM, UNKNOWN_ARTIST } from "../packages/shared/Consts"

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

    const artistName = await result.goTo
      .artist()
      .then((artistPage) => artistPage.getName())

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
      .then((albumPage) => albumPage.getTitle())

    expect(albumName).toEqual(UNKNOWN_ALBUM)
  })
})
