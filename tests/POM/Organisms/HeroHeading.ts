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
    await titleLocator.filter({ hasText: title }).waitFor({ state: "visible" })
  }

  async function getTitle(): Promise<string | undefined> {
    return titleLocator.textContent().then((title) => title ?? undefined)
  }
}
