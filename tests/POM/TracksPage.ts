/* eslint-disable unicorn/prefer-dom-node-text-content */
/* eslint-disable no-shadow */
import { TEST_IDS as id, testAttributes } from "../../packages/renderer/src/TestConsts"
import createBasePage from "./BasePage"

import type { ElectronApplication } from "playwright"

export default async function createTracksPage(electron: ElectronApplication) {
  const basePage = await createBasePage(electron)
  const page = await electron.firstWindow()

  const title = page.locator(id.asQuery.myTracksTitle)
  const trackItems = page.locator(id.asQuery.trackItems)

  return {
    ...basePage,

    getAddedFolders,
    getTracks,
    hasTracks,
    isDisplayed,
    playTrack,
    getTracksTitles,
  }

  async function isDisplayed(): Promise<boolean> {
    return title.isVisible()
  }

  async function hasTracks() {
    if ((await trackItems.count()) === 0) return false

    const tracks = await getTracks()
    const tracksAmount = tracks.length

    if (tracksAmount === 0) return false

    return true
  }

  async function getTracks() {
    const selector = {
      trackItem: testAttributes.asQuery.trackItem,
      trackItemTitle: testAttributes.asQuery.trackItemTitle,
      trackItemArtist: testAttributes.asQuery.trackItemArtist,
      trackItemAlbum: testAttributes.asQuery.trackItemAlbum,
      trackItemDuration: testAttributes.asQuery.trackItemDuration,
    }

    const tracks = await trackItems.evaluate(
      (node, selector) => {
        const trackItems = [...node.querySelectorAll(selector.trackItem)]

        const result = trackItems.map((track) => {
          const title = (
            track.querySelector(selector.trackItemTitle) as
              | HTMLElement
              | undefined
          )?.innerText.slice(0, 2)
          const album = (
            track.querySelector(selector.trackItemAlbum) as
              | HTMLElement
              | undefined
          )?.innerText
          const artist = (
            track.querySelector(selector.trackItemArtist) as
              | HTMLElement
              | undefined
          )?.innerText
          const duration = (
            track.querySelector(selector.trackItemDuration) as
              | HTMLElement
              | undefined
          )?.innerText

          return { title, album, artist, duration }
        })

        return result
      },
      selector,
      { timeout: 2000 }
    )

    return tracks
  }

  async function getTracksTitles(): Promise<string[]> {
    const tracks = await getTracks()
    const titles = tracks.map((track) => track.title || "")
    return titles
  }

  async function getAddedFolders(): Promise<number[]> {
    if (!(await hasTracks())) return []

    const tracks = await getTracks()

    const folders = tracks
      .map((track) => track.title?.at(0))
      // eslint-disable-next-line unicorn/no-array-reduce
      .reduce((accumulator, track) => {
        if (track === undefined) {
          console.error("Track title is undefined ")
          return accumulator
        }

        const folder = Number(track)

        if (accumulator.includes(folder)) {
          return accumulator
        }

        accumulator.push(folder)

        return accumulator
      }, [] as number[])

    return folders
  }

  async function playTrack(title: string): Promise<string> {
    if (title.at(-1) !== "_")
      throw new Error(
        `Invalid track title provided. It lacks the \`_\` at the end. \nProvided: ${title}`
      )

    const element = page.locator(testAttributes.asQuery.trackItem, {
      hasText: title,
    })

    await element.dblclick({ timeout: 2000 })

    return element.innerText()
  }
}
