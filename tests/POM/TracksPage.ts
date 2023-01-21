/* eslint-disable unicorn/prefer-dom-node-text-content */

import {
  TEST_ATTRIBUTES,
  TEST_IDS,
} from "../../packages/renderer/src/TestConsts"
import { removeDuplicates } from "../../packages/shared/Pures"

import { isE2ETrackTitle } from "./Helper"
import { createBasePage } from "./BasePage"

import type { ElectronApplication } from "playwright"

export async function createTracksPage(electron: ElectronApplication) {
  const basePage = await createBasePage(electron)
  const page = await electron.firstWindow()

  const pageTitle = page.locator(TEST_IDS.asQuery.myTracksTitle)
  const trackItems = page.locator(TEST_IDS.asQuery.trackItems)

  return {
    ...basePage,

    getAddedFolders,
    getTracks,
    getTracksTitles: getTrackTitles,
    hasTracks,
    isDisplayed,
    playTrack,
  }

  async function isDisplayed(): Promise<boolean> {
    return pageTitle.isVisible()
  }

  async function hasTracks() {
    if ((await trackItems.count()) === 0) return false

    const tracks = await getTracks()
    const tracksAmount = tracks.length

    if (tracksAmount === 0) return false

    return true
  }

  async function getTracks() {
    const selectors = {
      trackItem: TEST_ATTRIBUTES.asQuery.trackItem,
      trackItemTitle: TEST_ATTRIBUTES.asQuery.trackItemTitle,
      trackItemArtist: TEST_ATTRIBUTES.asQuery.trackItemArtist,
      trackItemAlbum: TEST_ATTRIBUTES.asQuery.trackItemAlbum,
      trackItemDuration: TEST_ATTRIBUTES.asQuery.trackItemDuration,
    }

    return trackItems.evaluate(
      // eslint-disable-next-line @typescript-eslint/no-shadow
      (node, selectors) => {
        const trackElements = [
          ...node.querySelectorAll(selectors.trackItem),
        ] as HTMLElement[]

        return trackElements.map((track) => {
          const title = (
            track.querySelector(selectors.trackItemTitle) as
              | HTMLElement
              | undefined
          )?.innerText.slice(0, 2)

          const album = (
            track.querySelector(selectors.trackItemAlbum) as
              | HTMLElement
              | undefined
          )?.innerText

          const artist = (
            track.querySelector(selectors.trackItemArtist) as
              | HTMLElement
              | undefined
          )?.innerText

          const duration = (
            track.querySelector(selectors.trackItemDuration) as
              | HTMLElement
              | undefined
          )?.innerText

          return { title, album, artist, duration }
        })
      },
      selectors,
      { timeout: 2000 }
    )
  }

  async function getTrackTitles(): Promise<string[]> {
    const tracks = await getTracks()
    const titles = tracks.map((track) => track.title || "")
    return titles
  }

  async function getAddedFolders(): Promise<number[]> {
    if (!(await hasTracks())) return []

    const tracks = await getTracks()

    const folders = tracks
      .map((track) => track.title?.at(0))
      .filter((item) => item !== undefined)
      .filter(removeDuplicates)
      .map(Number)

    return folders
  }

  /**
   * Play a track by its e2e title like "12".
   *
   * @param title In form of "01"
   * @returns The inner text of the element
   */
  async function playTrack(title: string): Promise<string> {
    if (!isE2ETrackTitle(title))
      throw new TypeError(
        `Invalid track title provided. \nProvided: ${title}\nExpected something like "01" or "23"`
      )

    const element = page.locator(TEST_ATTRIBUTES.asQuery.trackItem, {
      hasText: title + "_",
    })

    await element.dblclick({ timeout: 1000, position: { x: 4, y: 4 } })

    return element.innerText({ timeout: 1000 })
  }
}
