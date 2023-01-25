/* eslint-disable unicorn/prefer-dom-node-text-content */

import {
  TEST_ATTRIBUTES,
  TEST_IDS,
} from "../../packages/renderer/src/TestConsts"

import { createBasePage } from "./BasePage"
import { getCards } from "./Helper"

import type { ElectronApplication } from "playwright"

export async function createAlbumsPage(electron: ElectronApplication) {
  const basePage = await createBasePage(electron)
  const page = await electron.firstWindow()

  const pageTitle = page.locator("Your albums")
  const albumItems = page.locator(TEST_IDS.asQuery.albumCards)

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
    return getCards({ page, selector: TEST_ATTRIBUTES.asQuery.albumCard })
  }
}
