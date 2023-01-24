/* eslint-disable unicorn/prefer-dom-node-text-content */

import {
  TEST_ATTRIBUTES,
  TEST_IDS,
} from "../../packages/renderer/src/TestConsts"

import { createBasePage } from "./BasePage"

import type { ElectronApplication } from "playwright"

export async function createArtistsPage(electron: ElectronApplication) {
  const basePage = await createBasePage(electron)
  const page = await electron.firstWindow()

  const pageTitle = page.locator("Your artists")
  const artistItems = page.locator(TEST_IDS.asQuery.artistCards)

  return {
    ...basePage,

    getArtists,
    hasArtists,
    isDisplayed,
  }

  async function isDisplayed(): Promise<boolean> {
    return pageTitle.isVisible()
  }

  async function hasArtists() {
    if ((await artistItems.count()) === 0) return false

    const artists = await getArtists()
    const artistsAmount = artists.length

    if (artistsAmount === 0) return false

    return true
  }

  async function getArtists() {
    const cardSelector = TEST_ATTRIBUTES.asQuery.artistCard
    const selectors = {
      cardItem: cardSelector,
      cardItemArtistName:
        `${cardSelector} ${TEST_ATTRIBUTES.asQuery.cardTitle}` as const,
    }

    return artistItems.evaluate(
      // eslint-disable-next-line @typescript-eslint/no-shadow
      (node, selectors) => {
        const artistCardsElements = [
          ...node.querySelectorAll(selectors.cardItem),
        ] as HTMLElement[]

        return artistCardsElements.map((artist) => {
          const name = (
            artist.querySelector(selectors.cardItemArtistName) as
              | HTMLElement
              | undefined
          )?.innerText

          return { name }
        })
      },
      selectors,
      { timeout: 1000 }
    )
  }
}
