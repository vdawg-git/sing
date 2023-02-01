/* eslint-disable unicorn/prefer-dom-node-text-content */

import { PAGE_TITLES } from "@sing-renderer/Constants"

import { createBasePage } from "./BasePage"
import { createTrackListOrganism } from "./Organisms/TrackList"
import { createHeroHeadingOrganism } from "./Organisms/HeroHeading"

import type { ElectronApplication } from "playwright"

export async function createTracksPage(electron: ElectronApplication) {
  const basePage = await createBasePage(electron)
  // const page = await electron.firstWindow()

  const trackList = await createTrackListOrganism(electron)

  const heading = await createHeroHeadingOrganism(electron)

  return {
    ...basePage,

    trackList,
    heading,

    waitToBeVisible,
  }

  async function waitToBeVisible() {
    return heading.waitForTitle(PAGE_TITLES.tracks)
  }
}
