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

export async function createPlaylistsPage(electron: ElectronApplication) {
  const basePage = await createBasePage(electron)
  const page = await electron.firstWindow()

  const heading = await createHeroHeadingOrganism(electron)
  const playlistItems = page.locator(
    TEST_IDS.asQuery.playlistCards + " " + TEST_ATTRIBUTES.asQuery.playlistCard
  )

  return {
    ...basePage,

    getPlaylists,
    hasPlaylists,
    isDisplayed,
  }

  async function isDisplayed(): Promise<void> {
    return heading.waitForTitle(PAGE_TITLES.playlists)
  }

  async function hasPlaylists() {
    if ((await playlistItems.count()) === 0) return false

    const playlists = await getPlaylists()
    const playlistsAmount = playlists.length

    if (playlistsAmount === 0) return false

    return true
  }

  /**
   * @returns the playlist cards as objects with methods to interact with them.
   */
  async function getPlaylists() {
    return getCards({ page, selector: TEST_ATTRIBUTES.asQuery.playlistCard })
  }
}
