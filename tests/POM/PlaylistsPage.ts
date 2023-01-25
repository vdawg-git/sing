/* eslint-disable unicorn/prefer-dom-node-text-content */

import {
  TEST_ATTRIBUTES,
  TEST_IDS,
} from "../../packages/renderer/src/TestConsts"

import { createBasePage } from "./BasePage"
import { getCards } from "./Helper"

import type { ElectronApplication } from "playwright"

export async function createPlaylistsPage(electron: ElectronApplication) {
  const basePage = await createBasePage(electron)
  const page = await electron.firstWindow()

  const pageTitle = page.locator("Your playlists")
  const playlistItems = page.locator(
    TEST_IDS.asQuery.playlistCards + " " + TEST_ATTRIBUTES.asQuery.playlistCard
  )

  return {
    ...basePage,

    getPlaylists,
    hasPlaylists,
    isDisplayed,
  }

  async function isDisplayed(): Promise<boolean> {
    return pageTitle.isVisible()
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
