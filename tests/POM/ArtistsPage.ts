/* eslint-disable unicorn/prefer-dom-node-text-content */

import {
  TEST_ATTRIBUTES,
  TEST_IDS,
} from "../../packages/renderer/src/TestConsts"

import { createBasePage } from "./BasePage"
import { getCards } from "./Helper"

import type { ElectronApplication } from "playwright"

export async function createArtistsPage(electron: ElectronApplication) {
  const basePage = await createBasePage(electron)
  const page = await electron.firstWindow()

  const pageTitle = page.locator("Your artists")
  const artistItems = page.locator(
    TEST_IDS.asQuery.artistCards + " " + TEST_ATTRIBUTES.asQuery.artistCard
  )

  return {
    ...basePage,

    getArtists,
    hasArtists,
    isDisplayed,
  }

  async function isDisplayed(): Promise<boolean> {
    return pageTitle.isVisible()
  }

  async function hasArtists() {
    if ((await artistItems.count()) === 0) return false

    const artists = await getArtists()
    const artistsAmount = artists.length

    if (artistsAmount === 0) return false

    return true
  }

  /**
   * @returns Artist names as an array of strings
   */
  async function getArtists() {
    return getCards({ page, selector: TEST_ATTRIBUTES.asQuery.artistCard })
  }
}
