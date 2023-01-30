/* eslint-disable unicorn/prefer-dom-node-text-content */

import * as A from "fp-ts/lib/Array"

import {
  TEST_ATTRIBUTES,
  TEST_IDS,
} from "../../../packages/renderer/src/TestConsts"
import { removeDuplicates } from "../../../packages/shared/Pures"
import { getTrackTitle, isE2ETrackTitle } from "../Helper"

import { createMenuOrganism } from "./Menu"

import type { ElectronApplication, Locator } from "playwright"

export async function createTrackListOrganism(electron: ElectronApplication) {
  const page = await electron.firstWindow()

  const trackList = page.getByTestId(TEST_IDS.trackList),
    trackItems = trackList.locator(TEST_ATTRIBUTES.asQuery.trackItem)

  return {
    getAddedFolders,
    getTracks,
    getTrackTitles,
    hasTracks,
    playTrack,
    getTrackItem,
  }

  async function hasTracks() {
    if ((await trackList.count()) === 0) return false

    const tracks = await getTracks()
    const tracksAmount = tracks.length

    if (tracksAmount === 0) return false

    return true
  }

  async function getTracks() {
    return Promise.all(
      await trackItems.all().then(A.map(convertLocatorTotrackItem))
    )
  }

  async function getTrackItem(title: string) {
    if (!isE2ETrackTitle(title))
      throw new TypeError(
        `Invalid track title provided. \nProvided: ${title}\nExpected something like "01" or "23"`
      )

    return convertLocatorTotrackItem(
      trackItems.filter({ hasText: title + "_" })
    )
  }

  async function getTrackTitles(): Promise<string[]> {
    const tracks = await getTracks()
    const titles = tracks.map((track) => track.title || "")
    return titles
  }

  /**
   * Get the folders from where the displayed tracks are coming from.
   *
   * Tracks with a title starting with `0` are from the folder `0` and so on.
   */
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

  async function convertLocatorTotrackItem(trackLocator: Locator) {
    const title = await trackLocator
      .locator(TEST_ATTRIBUTES.asQuery.trackItemTitle)
      .textContent({ timeout: 500 })
      .then((titleRaw) => (titleRaw ? getTrackTitle(titleRaw) : undefined))
    const album =
      (await trackLocator
        .locator(TEST_ATTRIBUTES.asQuery.trackItemAlbum)
        .textContent({ timeout: 500 })) ?? undefined
    const artist =
      (await trackLocator
        .locator(TEST_ATTRIBUTES.asQuery.trackItemArtist)
        .textContent({ timeout: 500 })) ?? undefined
    const duration =
      (await trackLocator
        .locator(TEST_ATTRIBUTES.asQuery.trackItemDuration)
        .textContent({ timeout: 500 })) ?? undefined

    return {
      title,
      album,
      artist,
      duration,

      async play() {
        return trackLocator.dblclick({ timeout: 1000 })
      },
      async openContextMenu() {
        await trackLocator.click({ button: "right", timeout: 1000 })

        return createMenuOrganism(electron)
      },
      /**
       * Add to a playlist via the context menu.
       *
       * When `playlist` is `"NEW"` create a new one.
       */
      async addToPlaylist(playlist: string | "NEW") {
        await trackLocator.click({ button: "right", timeout: 1000 })

        await createMenuOrganism(electron).then((menu) =>
          playlist === "NEW"
            ? menu.addToNewPlaylist()
            : menu.addToExistingPlaylist(playlist)
        )
      },
    }
  }
}
