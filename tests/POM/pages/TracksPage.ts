/* eslint-disable unicorn/prefer-dom-node-text-content */

import { PAGE_TITLES } from "@sing-renderer/Constants"

import type { ElectronApplication } from "playwright"

import { createBasePage } from "#pages/BasePage"
import { createTrackListOrganism } from "#organisms/TrackList"
import { createHeroHeadingOrganism } from "#organisms/HeroHeading"

export async function createTracksPage(electron: ElectronApplication) {
  const basePage = await createBasePage(electron)

  const trackList = await createTrackListOrganism(electron)

  const heading = await createHeroHeadingOrganism(electron)

  return {
    ...basePage,

    trackList,
    heading,

    waitToBeVisible,
  }

  async function waitToBeVisible() {
    await heading.waitForTitle(PAGE_TITLES.tracks)
  }
}
