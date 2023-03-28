/* eslint-disable unicorn/prefer-dom-node-text-content */

import { PAGE_TITLES } from "@sing-renderer/Constants"
import { TEST_ATTRIBUTES, TEST_IDS } from "@sing-renderer/TestConsts"
import { UNKNOWN_ARTIST } from "@sing-shared/Consts"

import type { ElectronApplication, Locator } from "playwright"
import type { EndToEndFolder } from "#/Types"

import { createBasePage } from "#pages/BasePage"
import { createHeroHeadingOrganism } from "#organisms/HeroHeading"
import { createCardsOrganism } from "#organisms/Cards"

export async function createArtistsPage(electron: ElectronApplication) {
  const basePage = await createBasePage(electron)

  const heading = await createHeroHeadingOrganism(electron)
  const cards = await createCardsOrganism(electron, {
    wrapperID: TEST_IDS.artistCardsGrid,
    allCardsAttribute: TEST_ATTRIBUTES.asQuery.artistCard,
  })

  return {
    ...basePage,
    cards,

    waitToBeVisible,
    getArtistsByFolder,
  }

  async function waitToBeVisible(): Promise<void> {
    await heading.waitForTitle(PAGE_TITLES.artists)
  }

  function getArtistsByFolder(folder: EndToEndFolder): Locator {
    const regex = createArtistRegex(folder)

    return cards.getCardByTitle(regex)
  }
}

function createArtistRegex(folder: EndToEndFolder) {
  const regex = `^${folder}/d_.*$`

  return new RegExp(folder === 0 ? regex + "|" + UNKNOWN_ARTIST : regex)
}
