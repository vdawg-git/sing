/* eslint-disable unicorn/prefer-dom-node-text-content */

import { PAGE_TITLES } from "@sing-renderer/Constants"

import { TEST_ATTRIBUTES } from "../../packages/renderer/src/TestConsts"

import { createBasePage } from "./BasePage"
import { createHeroHeadingOrganism } from "./Organisms/HeroHeading"
import { createCardsOrganism } from "./Organisms/Cards"

import type { ElectronApplication } from "playwright"

export async function createAlbumsPage(electron: ElectronApplication) {
  const basePage = await createBasePage(electron)
  // const page = await electron.firstWindow()

  const heading = await createHeroHeadingOrganism(electron)
  const cards = await createCardsOrganism(
    electron,
    TEST_ATTRIBUTES.asQuery.albumCard
  )

  // const albumsGrid = page.locator(TEST_IDS.asQuery.albumCards)

  return {
    ...basePage,
    cards,

    waitToBeVisible,
  }

  async function waitToBeVisible() {
    return heading.waitForTitle(PAGE_TITLES.albums)
  }
}
