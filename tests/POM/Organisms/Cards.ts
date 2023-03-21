import { TEST_ATTRIBUTES } from "@sing-renderer/TestConsts"

import type { ITestAttributeAsQuery } from "@sing-renderer/TestConsts"
import type { ElectronApplication, Page } from "playwright"

export async function createCardsOrganism(
  electron: ElectronApplication,
  selector: ITestAttributeAsQuery
) {
  const page = await electron.firstWindow()
  const cards = page.locator(selector)

  return {
    getAll: () => getAll({ page, selector }),
    hasCards,
  }

  async function hasCards() {
    return (await cards.count()) > 0
  }
}

export async function getAll({
  page,
  selector,
}: {
  page: Page
  selector: ITestAttributeAsQuery
}) {
  const locators = await page.locator(selector).all()

  return locators.map((card) => ({
    async clickPlay() {
      return card
        .hover()
        .then(() =>
          card
            .locator(TEST_ATTRIBUTES.asQuery.cardPlay)
            .click({ timeout: 2000 })
        )
    },
    /**
     * Gets the data of the card as text.
     */
    async getData() {
      const title =
        (await card
          .locator(TEST_ATTRIBUTES.asQuery.cardTitle)
          .textContent({ timeout: 2000 })) ?? undefined
      const subtext =
        (await card
          .locator(TEST_ATTRIBUTES.asQuery.cardSecondaryText)
          .textContent({ timeout: 2000 })) ?? undefined

      return { title, subtext }
    },
  }))
}
