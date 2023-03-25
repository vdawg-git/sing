/* eslint-disable unicorn/prefer-dom-node-text-content */

import { TEST_ATTRIBUTES, TEST_IDS } from "@sing-renderer/TestConsts"

// import { createMenuOrganism } from "./Menu"

import type { EndToEndFolder } from "#/Types"
import type { ElectronApplication } from "playwright"

import { makeE2ETitle } from "#/Helper"

export async function createTrackListOrganism(electron: ElectronApplication) {
  const page = await electron.firstWindow()

  const trackList = page.getByTestId(TEST_IDS.trackList),
    trackItems = trackList.locator(TEST_ATTRIBUTES.asQuery.trackItem)

  return {
    getTrackItem,
    getByFolder,
    playTrack,
    trackItems,
  }

  /**
   *
   * @param title An e2e track title like `01_` or `01`
   * @returns A locator matching the track item
   */
  async function getTrackItem(title: string) {
    const trackTitle = makeE2ETitle(title)

    return trackItems.filter({
      has: page.locator(TEST_ATTRIBUTES.asQuery.trackItemTitle, {
        hasText: trackTitle,
      }),
    })
  }

  /**
   * Get the folders from where the displayed tracks are coming from.
   *
   * Tracks with a title starting with `0` are from the folder `0` and so on.
   */
  async function getByFolder(folderName: EndToEndFolder) {
    const regex = new RegExp("^" + folderName + "d.*$")

    return trackItems.filter({
      has: page.locator(TEST_ATTRIBUTES.asQuery.trackItemTitle, {
        hasText: regex,
      }),
    })
  }

  /**
   * Play a track by its e2e title like "12_" or "12".
   *
   * @param title In form of "01_" or "01"
   * @returns The inner text of the element
   */
  async function playTrack(title: string) {
    const trackItem = await getTrackItem(title)
    await trackItem.dblclick({ position: { x: 4, y: 4 } })
  }

  // async function convertLocatorTotrackItem(trackLocator: Locator) {
  //   const title = await trackLocator
  //     .locator(TEST_ATTRIBUTES.asQuery.trackItemTitle)
  //     .textContent({ timeout: 500 })
  //     .then((titleRaw) => (titleRaw ? getTrackTitle(titleRaw) : undefined))
  //   const album =
  //     (await trackLocator
  //       .locator(TEST_ATTRIBUTES.asQuery.trackItemAlbum)
  //       .textContent({ timeout: 500 })) ?? undefined
  //   const artist =
  //     (await trackLocator
  //       .locator(TEST_ATTRIBUTES.asQuery.trackItemArtist)
  //       .textContent({ timeout: 500 })) ?? undefined
  //   const duration =
  //     (await trackLocator
  //       .locator(TEST_ATTRIBUTES.asQuery.trackItemDuration)
  //       .textContent({ timeout: 500 })) ?? undefined

  //   return {
  //     title,
  //     album,
  //     artist,
  //     duration,

  //     async play() {
  //       return trackLocator.dblclick({ timeout: 1000 })
  //     },
  //     async openContextMenu() {
  //       await trackLocator.click({ button: "right", timeout: 1000 })

  //       return createMenuOrganism(electron)
  //     },
  //     /**
  //      * Add to a playlist via the context menu.
  //      *
  //      * When `playlist` is `"NEW"` create a new one.
  //      */
  //     async addToPlaylist(playlist: string | "NEW") {
  //       await trackLocator.click({ button: "right", timeout: 1000 })

  //       await createMenuOrganism(electron).then((menu) =>
  //         playlist === "NEW"
  //           ? menu.addToNewPlaylist()
  //           : menu.addToExistingPlaylist(playlist)
  //       )
  //     },
  //   }
  // }
}
