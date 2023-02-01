/* eslint-disable unicorn/prefer-dom-node-text-content */

import { createBasePage } from "./BasePage"
import { createHeroHeadingOrganism } from "./Organisms/HeroHeading"

import type { ElectronApplication } from "playwright"

export async function createAlbumPage(electron: ElectronApplication) {
  // const page = await electron.firstWindow()

  const basePage = await createBasePage(electron)
  const heading = await createHeroHeadingOrganism(electron)

  return {
    ...basePage,

    heading,
  }
}
