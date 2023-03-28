/* eslint-disable unicorn/prefer-dom-node-text-content */

import { PAGE_TITLES } from "@sing-renderer/Constants"
import { TEST_ATTRIBUTES, TEST_IDS } from "@sing-renderer/TestConsts"
import { UNKNOWN_ALBUM } from "@sing-shared/Consts"

import type { ElectronApplication, Locator } from "playwright"
import type { EndToEndFolder } from "#/Types"

import { createBasePage } from "#pages/BasePage"
import { createHeroHeadingOrganism } from "#organisms/HeroHeading"
import { createCardsOrganism } from "#organisms/Cards"

export async function createAlbumsPage(electron: ElectronApplication) {
  const basePage = await createBasePage(electron)

  const heading = await createHeroHeadingOrganism(electron)
  const cards = await createCardsOrganism(electron, {
    wrapperID: TEST_IDS.albumCardsGrid,
    allCardsAttribute: TEST_ATTRIBUTES.asQuery.albumCard,
  })

  return {
    ...basePage,
    cards,

    waitToBeVisible,
    getAlbumsByFolder,
  }

  async function waitToBeVisible() {
    return heading.waitForTitle(PAGE_TITLES.albums)
  }

  function getAlbumsByFolder(folder: EndToEndFolder): Locator {
    const regex = createAlbumRegex(folder)

    return cards.getCardByTitle(regex)
  }
}

function createAlbumRegex(folder: EndToEndFolder) {
  // Unknown album for folder 0 must be accounted for too
  const regex = `^${folder}/d_.*$`

  return new RegExp(folder === 0 ? regex + "|" + UNKNOWN_ALBUM : regex)
}
