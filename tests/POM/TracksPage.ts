/* eslint-disable unicorn/prefer-dom-node-text-content */

import { TEST_IDS } from "../../packages/renderer/src/TestConsts"

import { createBasePage } from "./BasePage"
import { createTrackListOrganism } from "./Organisms/TrackList"

import type { ElectronApplication } from "playwright"

export async function createTracksPage(electron: ElectronApplication) {
  const basePage = await createBasePage(electron)
  const page = await electron.firstWindow()

  const trackList = await createTrackListOrganism(electron)

  const pageTitle = page.getByTestId(TEST_IDS.yourTracksTitle)

  return {
    ...basePage,

    trackList,

    isDisplayed,
  }

  async function isDisplayed(): Promise<boolean> {
    return pageTitle.isVisible()
  }
}
