import { TEST_ATTRIBUTES } from "../../packages/renderer/src/TestConsts"

import type { ITestAttributeAsQuery } from "../../packages/renderer/src/TestConsts"
import type { Page } from "playwright"

/**
 * Return the folder name of the track title by taking its first letter
 */
export function getFolderFromTitle(title: string): number {
  const folder = title.at(0)

  if (!folder) throw new TypeError("Empty string passed to getFolderFromTitle")
  if (Number.isNaN(Number(folder)))
    throw new TypeError(`Invalid track title: ${title}`)

  return Number(title)
}

export function isMediaElement(
  element: HTMLElement | SVGElement
): element is HTMLMediaElement {
  if (element.nodeName === "AUDIO") return true
  if (element.nodeName === "VIDEO") return true

  return false
}

export function convertDisplayTimeToSeconds(displayTime: string) {
  const [minutes, seconds] = displayTime.split(":").map(Number)

  return minutes * 60 + seconds
}

/**
 * Get the track title for e2e from the rendered title
 * @param trackTitle - Title as rendered, for example: `01_Lorem Ipsum`
 * @returns Title for e2e testing like `01`
 */
export function getTrackTitle(trackTitle: string): string {
  return trackTitle.slice(0, 2)
}

/**
 * Checks if the provided string is an e2e track title like `01`, or `20`
 */
export function isE2ETrackTitle(trackTitle: string): boolean {
  return !!trackTitle.match(/^\d\d$/)?.length
}

/**
 *
 * @param cardSelector
 */
export async function getCards({
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
