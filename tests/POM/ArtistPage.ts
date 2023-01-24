/* eslint-disable unicorn/prefer-dom-node-text-content */

import { TEST_IDS } from "../../packages/renderer/src/TestConsts"

import { createBasePage } from "./BasePage"

import type { ElectronApplication } from "playwright"

export async function createArtistPage(electron: ElectronApplication) {
  const basePage = await createBasePage(electron)
  const page = await electron.firstWindow()

  const pageTitle = page.locator(TEST_IDS.asQuery.artistHeroTitle)

  return {
    ...basePage,

    getName,
    isDisplayed,
  }

  async function isDisplayed(): Promise<boolean> {
    return pageTitle.isVisible()
  }

  async function getName(): Promise<string | undefined> {
    return (await pageTitle.textContent({ timeout: 2000 })) ?? undefined
  }
}
