/* eslint-disable unicorn/prefer-dom-node-text-content */

import type { ElectronApplication } from "playwright"

import { createBasePage } from "#pages/BasePage"
import { createHeroHeadingOrganism } from "#organisms/HeroHeading"

export async function createAlbumPage(electron: ElectronApplication) {
  const basePage = await createBasePage(electron)
  const heading = await createHeroHeadingOrganism(electron)

  return {
    ...basePage,

    heading,
  }
}
