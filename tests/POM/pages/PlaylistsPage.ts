/* eslint-disable unicorn/prefer-dom-node-text-content */

import { PAGE_TITLES } from "@sing-renderer/Constants"
import { TEST_ATTRIBUTES, TEST_IDS } from "@sing-renderer/TestConsts"

import type { ElectronApplication } from "playwright"

import { createBasePage } from "#pages/BasePage"
import { createHeroHeadingOrganism } from "#organisms/HeroHeading"
import { createCardsOrganism } from "#organisms/Cards"

export async function createPlaylistsPage(electron: ElectronApplication) {
  const basePage = await createBasePage(electron)
  // const page = await electron.firstWindow()

  const heading = await createHeroHeadingOrganism(electron)
  const cards = await createCardsOrganism(electron, {
    allCardsAttribute: TEST_ATTRIBUTES.asQuery.playlistCard,
    wrapperID: TEST_IDS.playlistCardsGrid,
  })

  return {
    ...basePage,
    cards,

    isDisplayed,
  }

  async function isDisplayed(): Promise<void> {
    return heading.waitForTitle(PAGE_TITLES.playlists)
  }
}
