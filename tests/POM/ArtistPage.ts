/* eslint-disable unicorn/prefer-dom-node-text-content */

// import { TEST_IDS } from "../../packages/renderer/src/TestConsts"

import { createBasePage } from "./BasePage"
import { createHeroHeadingOrganism } from "./Organisms/HeroHeading"

import type { ElectronApplication } from "playwright"

export async function createArtistPage(electron: ElectronApplication) {
  const basePage = await createBasePage(electron)
  // const page = await electron.firstWindow()

  const heading = await createHeroHeadingOrganism(electron)

  return {
    ...basePage,

    heading,
  }
}
