/* eslint-disable unicorn/prefer-dom-node-text-content */

import { PAGE_TITLES } from "@sing-renderer/Constants"

import { TEST_ATTRIBUTES } from "../../packages/renderer/src/TestConsts"

import { createBasePage } from "./BasePage"
import { createHeroHeadingOrganism } from "./Organisms/HeroHeading"
import { createCardsOrganism } from "./Organisms/Cards"

import type { ElectronApplication } from "playwright"

export async function createArtistsPage(electron: ElectronApplication) {
  const basePage = await createBasePage(electron)
  // const page = await electron.firstWindow()

  const heading = await createHeroHeadingOrganism(electron)
  const cards = await createCardsOrganism(
    electron,
    TEST_ATTRIBUTES.asQuery.artistCard
  )

  // const artistItems = page.locator(TEST_IDS.asQuery.artistCards)

  return {
    ...basePage,
    cards,

    waitToBeVisible,
  }

  async function waitToBeVisible(): Promise<void> {
    await heading.waitForTitle(PAGE_TITLES.artists)
  }
}
