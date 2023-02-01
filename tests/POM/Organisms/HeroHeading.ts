/* eslint-disable unicorn/prefer-dom-node-text-content */

import { TEST_IDS } from "@sing-renderer/TestConsts"

import type { ElectronApplication } from "playwright"

export async function createHeroHeadingOrganism(electron: ElectronApplication) {
  const page = await electron.firstWindow()

  const hero = page.getByTestId(TEST_IDS.heroHeading),
    titleLocator = hero.getByTestId(TEST_IDS.heroHeadingTitle)

  return {
    waitForTitle,
    getTitle,
  }

  async function waitForTitle(title: string) {
    return titleLocator.filter({ hasText: title }).waitFor({ timeout: 1000 })
  }

  async function getTitle(): Promise<string | undefined> {
    return titleLocator
      .textContent({ timeout: 500 })
      .then((title) => title ?? undefined)
  }
}
