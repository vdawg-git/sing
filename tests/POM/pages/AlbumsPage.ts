/* eslint-disable unicorn/prefer-dom-node-text-content */

import { PAGE_TITLES } from "@sing-renderer/Constants"
import { TEST_ATTRIBUTES, TEST_IDS } from "@sing-renderer/TestConsts"

import type { ElectronApplication } from "playwright"

import { createBasePage } from "#pages/BasePage"
import { createHeroHeadingOrganism } from "#organisms/HeroHeading"
import { createCardsOrganism } from "#organisms/Cards"



export async function createAlbumsPage(electron: ElectronApplication) {
  const basePage = await createBasePage(electron)
  // const page = await electron.firstWindow()

  const heading = await createHeroHeadingOrganism(electron)
  const cards = await createCardsOrganism(electron, {
    wrapperID: TEST_IDS.albumCardsGrid,
    allCardsAttribute: TEST_ATTRIBUTES.asQuery.albumCard,
  })

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
