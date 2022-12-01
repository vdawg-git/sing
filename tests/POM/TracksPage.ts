/* eslint-disable unicorn/prefer-dom-node-text-content */
import { TEST_ATTRIBUTES, TEST_IDS } from "../../packages/renderer/src/TestConsts"
import { removeDuplicates } from "../../packages/shared/Pures"

import createBasePage from "./BasePage"

import type { ElectronApplication } from "playwright"

export default async function createTracksPage(electron: ElectronApplication) {
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

    const tracks = await trackItems.evaluate(
      // eslint-disable-next-line @typescript-eslint/no-shadow
      (node, selectors) => {
        const trackElements = [
          ...node.querySelectorAll(selectors.trackItem),
        ] as HTMLElement[]

        const result = trackElements.map((track) => {
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

        return result
      },
      selectors,
      { timeout: 2000 }
    )

    return tracks
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

  async function playTrack(title: string): Promise<string> {
    if (title.at(-1) !== "_")
      throw new Error(
        `Invalid track title provided. It lacks the \`_\` at the end. \nProvided: ${title}`
      )

    const element = page.locator(TEST_ATTRIBUTES.asQuery.trackItem, {
      hasText: title,
    })

    await element.dblclick({ timeout: 2000 })

    return element.innerText()
  }
}
