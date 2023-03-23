/* eslint-disable unicorn/prefer-dom-node-text-content */

// import { TEST_IDS } from "@sing-renderer/TestConsts"

import type { ElectronApplication } from "playwright"

import { createBasePage } from "#pages/BasePage"
import { createHeroHeadingOrganism } from "#organisms/HeroHeading"

export async function createArtistPage(electron: ElectronApplication) {
  const basePage = await createBasePage(electron)
  // const page = await electron.firstWindow()

  const heading = await createHeroHeadingOrganism(electron)

  return {
    ...basePage,

    heading,
  }
}
