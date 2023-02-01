/* eslint-disable unicorn/prefer-dom-node-text-content */

import { PAGE_TITLES } from "@sing-renderer/Constants"

import {
  TEST_ATTRIBUTES,
  TEST_IDS,
} from "../../packages/renderer/src/TestConsts"

import { createBasePage } from "./BasePage"
import { getCards } from "./Helper"
import { createHeroHeadingOrganism } from "./Organisms/HeroHeading"

import type { ElectronApplication } from "playwright"

export async function createArtistsPage(electron: ElectronApplication) {
  const basePage = await createBasePage(electron)
  const page = await electron.firstWindow()

  const heading = await createHeroHeadingOrganism(electron)
  const artistItems = page.locator(
    TEST_IDS.asQuery.artistCards + " " + TEST_ATTRIBUTES.asQuery.artistCard
  )

  return {
    ...basePage,

    getArtists,
    hasArtists,
    waitToBeVisible,
  }

  async function waitToBeVisible(): Promise<void> {
    await heading.waitForTitle(PAGE_TITLES.artists)
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
