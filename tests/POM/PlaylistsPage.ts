/* eslint-disable unicorn/prefer-dom-node-text-content */

import { PAGE_TITLES } from "@sing-renderer/Constants"

import { TEST_ATTRIBUTES } from "../../packages/renderer/src/TestConsts"

import { createBasePage } from "./BasePage"
import { createHeroHeadingOrganism } from "./Organisms/HeroHeading"
import { createCardsOrganism } from "./Organisms/Cards"

import type { ElectronApplication } from "playwright"

export async function createPlaylistsPage(electron: ElectronApplication) {
  const basePage = await createBasePage(electron)
  // const page = await electron.firstWindow()

  const heading = await createHeroHeadingOrganism(electron)
  const cards = await createCardsOrganism(
    electron,
    TEST_ATTRIBUTES.asQuery.playlistCard
  )

  return {
    ...basePage,
    cards,

    isDisplayed,
  }

  async function isDisplayed(): Promise<void> {
    return heading.waitForTitle(PAGE_TITLES.playlists)
  }
}
