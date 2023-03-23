/* eslint-disable unicorn/prefer-dom-node-text-content */

import { TEST_ATTRIBUTES, TEST_IDS } from "@sing-renderer/TestConsts"

import type { ElectronApplication, Locator } from "playwright"

import { createAlbumPage } from "#pages/AlbumPage"
import { createArtistPage } from "#pages/ArtistPage"

type E2ESearchResult = {
  title: string
  album?: string
  artist?: string
  type?: string
}

export async function createSearchbarOrganism(electron: ElectronApplication) {
  const page = await electron.firstWindow()

  //   const searchbar = page.locator(TEST_IDS.asQuery.searchbar)
  const resultsLocator = page.locator(TEST_ATTRIBUTES.asQuery.searchbarResult)
  const searchInput = page.locator(
    TEST_IDS.asQuery.searchbar + " input[type=text]"
  )

  return {
    getFirstResult,
    getSearchResults,
    search,
    searchTitle,
  }

  /**
   * Generally search for a query
   */
  async function search(query: string) {
    await searchInput.type(query, { timeout: 1000 })
  }

  /**
   * Search for a track title. Like {@link search} but appends a `_` to the query.
   */
  async function searchTitle(query: string) {
    await search(query + "_")
  }

  async function getSearchResults() {
    return resultsLocator
      .all()
      .then((locators) => locators.map(createSearchResult))
  }

  async function getFirstResult() {
    const locators = await resultsLocator.all()

    return locators.length > 0 ? createSearchResult(locators[0]) : undefined
  }

  function createSearchResult(resultLocator: Locator) {
    return {
      async click() {
        resultLocator.click()
      },
      async getData() {
        const selectors = {
          title: TEST_ATTRIBUTES.asQuery.searchbarResultTitle,
          album: TEST_ATTRIBUTES.asQuery.searchbarResultAlbum,
          artist: TEST_ATTRIBUTES.asQuery.searchbarResultArtist,
          type: TEST_ATTRIBUTES.asQuery.searchbarResultType,
        }

        // eslint-disable-next-line @typescript-eslint/no-shadow
        return resultLocator.evaluate((node, selectors) => {
          const titleBase: string | undefined =
            (node.querySelector(selectors.title) as HTMLElement)?.innerText ??
            undefined
          const album: string | undefined =
            (node.querySelector(selectors.album) as HTMLElement)?.innerText ??
            undefined
          const artist: string | undefined =
            (node.querySelector(selectors.artist) as HTMLElement)?.innerText ??
            undefined
          const type: string | undefined =
            (node.querySelector(selectors.type) as HTMLElement)?.innerText ??
            undefined

          return {
            title: titleBase && titleBase.slice(0, 2), // Convert to e2e title
            album,
            artist,
            type,
          } as E2ESearchResult
        }, selectors)
      },
      goTo: {
        album: async () => goToAlbum(resultLocator),
        artist: async () => goToArtist(resultLocator),
      },
    }
  }

  async function goToAlbum(resultLocator: Locator) {
    await resultLocator
      .locator(TEST_ATTRIBUTES.asQuery.searchbarResultAlbum)
      .click({ timeout: 1000 })

    return createAlbumPage(electron)
  }
  async function goToArtist(resultLocator: Locator) {
    await resultLocator
      .locator(TEST_ATTRIBUTES.asQuery.searchbarResultArtist)
      .click({ timeout: 1000 })

    return createArtistPage(electron)
  }
}
