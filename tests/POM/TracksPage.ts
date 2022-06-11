import { TEST_IDS as id } from "../../packages/renderer/src/TestConsts"

import { Page } from "playwright"
import createBasePage from "./Base"

export default function createTracksPage(page: Page) {
  const title = page.locator(id.asQuery.myTracksTitle)

  return { ...createBasePage(page), isDisplayed }

  async function isDisplayed() {
    return title.isVisible()
  }
}
