import { TEST_ATTRIBUTES } from "@sing-renderer/TestConsts"

import type { ITestAttributeAsQuery, ITestID } from "@sing-renderer/TestConsts"
import type { ElectronApplication } from "playwright"

export async function createCardsOrganism(
  electron: ElectronApplication,
  selectors: { wrapperID: ITestID; allCardsAttribute: ITestAttributeAsQuery }
) {
  const page = await electron.firstWindow()
  const wrapper = page.getByTestId(selectors.wrapperID)
  const allCards = wrapper.locator(selectors.allCardsAttribute)

  return {
    allCards,
    getCardByTitle,
  }

  function getCardByTitle(title: string | RegExp) {
    return allCards.filter({
      has: page.locator(TEST_ATTRIBUTES.asQuery.cardTitle, {
        hasText: title,
      }),
    })
  }
}

// async function getAll({
//   page,
//   selector,
// }: {
//   page: Page
//   selector: ITestAttributeAsQuery
// }) {
//   const locators = await page.locator(selector).all()

//   return locators.map((card) => ({
//     async clickPlay() {
//       return card
//         .hover()
//         .then(() =>
//           card
//             .locator(TEST_ATTRIBUTES.asQuery.cardPlay)
//             .click({ timeout: 2000 })
//         )
//     },
//     /**
//      * Gets the data of the card as text.
//      */
//     async getData() {
//       const title =
//         (await card
//           .locator(TEST_ATTRIBUTES.asQuery.cardTitle)
//           .textContent({ timeout: 2000 })) ?? undefined
//       const subtext =
//         (await card
//           .locator(TEST_ATTRIBUTES.asQuery.cardSecondaryText)
//           .textContent({ timeout: 2000 })) ?? undefined

//       return { title, subtext }
//     },
//   }))
// }
