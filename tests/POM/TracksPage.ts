import {
  testAttr,
  TEST_IDS as id,
} from "../../packages/renderer/src/TestConsts"

import { ElectronApplication } from "playwright"
import createBasePage from "./BasePage"

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

    const tracksAmount = (await getTracks()).length

    if (tracksAmount === 0) return false

    return true
  }

  async function getTracks() {
    const selector = {
      trackItem: testAttr.asQuery.trackItem,
      trackItemTitle: testAttr.asQuery.trackItemTitle,
      trackItemArtist: testAttr.asQuery.trackItemArtist,
      trackItemAlbum: testAttr.asQuery.trackItemAlbum,
      trackItemDuration: testAttr.asQuery.trackItemDuration,
    }

    const tracks = await trackItems.evaluate(
      (node, selector) => {
        const trackItems = Array.from(node.querySelectorAll(selector.trackItem))

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
    const titles = (await getTracks()).map((track) => track.title || "")
    return titles
  }

  async function getAddedFolders(): Promise<number[]> {
    if (!(await hasTracks())) return []

    const tracks = await getTracks()

    const folders = tracks
      .map((track) => track.title?.at(0))
      .reduce((acc, track) => {
        if (track === undefined) {
          console.error("Track title is undefined ")
          return acc
        }

        const folder = Number(track)

        if (acc.indexOf(folder) !== -1) {
          return acc
        }

        acc.push(folder)

        return acc
      }, [] as number[])

    return folders
  }

  async function playTrack(title: string): Promise<string> {
    if (title.at(-1) !== "_")
      throw new Error(
        "Invalid track title provided. It lacks the `_` at the end. \nProvided: " +
          title
      )

    const element = page.locator(testAttr.asQuery.trackItem, {
      hasText: title,
    })

    await element.dblclick({ timeout: 2000 })

    return element.innerText()
  }
}
