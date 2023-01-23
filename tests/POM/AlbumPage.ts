/* eslint-disable unicorn/prefer-dom-node-text-content */

import {
  TEST_ATTRIBUTES,
  TEST_IDS,
} from "../../packages/renderer/src/TestConsts"

import { createBasePage } from "./BasePage"

import type { ElectronApplication } from "playwright"

export async function createAlbumsPage(electron: ElectronApplication) {
  const basePage = await createBasePage(electron)
  const page = await electron.firstWindow()

  const pageTitle = page.locator("Your albums")
  const albumItems = page.locator(TEST_IDS.asQuery.albumItems)

  return {
    ...basePage,

    getAlbums,
    hasAlbums,
    isDisplayed,
  }

  async function isDisplayed(): Promise<boolean> {
    return pageTitle.isVisible()
  }

  async function hasAlbums() {
    if ((await albumItems.count()) === 0) return false

    const albums = await getAlbums()
    const albumsAmount = albums.length

    if (albumsAmount === 0) return false

    return true
  }

  async function getAlbums() {
    const cardSelector = TEST_ATTRIBUTES.asQuery.albumCard
    const selectors = {
      cardItem: cardSelector,
      cardItemTitle:
        `${cardSelector} ${TEST_ATTRIBUTES.asQuery.cardTitle}` as const,
      cardItemArtist:
        `${cardSelector} ${TEST_ATTRIBUTES.asQuery.cardSecondaryText}` as const,
    }

    return albumItems.evaluate(
      // eslint-disable-next-line @typescript-eslint/no-shadow
      (node, selectors) => {
        const albumCardsElements = [
          ...node.querySelectorAll(selectors.cardItem),
        ] as HTMLElement[]

        return albumCardsElements.map((album) => {
          const title = (
            album.querySelector(selectors.cardItemTitle) as
              | HTMLElement
              | undefined
          )?.innerText

          const artist = (
            album.querySelector(selectors.cardItemArtist) as
              | HTMLElement
              | undefined
          )?.innerText

          return { title, artist }
        })
      },
      selectors,
      { timeout: 1000 }
    )
  }
}
