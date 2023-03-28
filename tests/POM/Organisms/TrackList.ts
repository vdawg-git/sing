/* eslint-disable unicorn/prefer-dom-node-text-content */

import { TEST_ATTRIBUTES, TEST_IDS } from "@sing-renderer/TestConsts"

import type { EndToEndFolder } from "#/Types"
import type { ElectronApplication, Locator } from "playwright"

import { createMenuOrganism } from "#organisms/Menu"
import { getTrackTitle, makeE2ETitle } from "#/Helper"

export async function createTrackListOrganism(electron: ElectronApplication) {
  const page = await electron.firstWindow()

  const trackList = page.getByTestId(TEST_IDS.trackList),
    trackItems = trackList.locator(TEST_ATTRIBUTES.asQuery.trackItem)

  return {
    trackItems,
    getByFolder,
    getTrackItem,
    getTrackTitles,
    getTracks,
    playTrack,
  }

  async function getTracks() {
    return Promise.all(
      await trackItems
        .all()
        .then((items) => items.map(convertLocatorTotrackItem))
    )
  }

  async function getTrackTitles() {
    return Promise.all(
      await getTracks().then((items) => items.map((item) => item.getTitle()))
    )
  }

  /**
   *
   * @param title An e2e track title like `01_` or `01`
   * @returns A locator matching the track item
   */
  async function getTrackItem(title: string) {
    const trackTitle = makeE2ETitle(title)

    return convertLocatorTotrackItem(
      trackItems.filter({
        has: page.locator(TEST_ATTRIBUTES.asQuery.trackItemTitle, {
          hasText: trackTitle,
        }),
      })
    )
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
    await trackItem.play()
  }

  async function convertLocatorTotrackItem(trackLocator: Locator) {
    const title = trackLocator.locator(TEST_ATTRIBUTES.asQuery.trackItemTitle)

    const album = trackLocator.locator(TEST_ATTRIBUTES.asQuery.trackItemAlbum)
    const artist = trackLocator.locator(TEST_ATTRIBUTES.asQuery.trackItemArtist)

    const duration = trackLocator.locator(
      TEST_ATTRIBUTES.asQuery.trackItemDuration
    )

    return {
      title,
      album,
      artist,
      duration,
      locator: trackLocator,

      getTitle: () =>
        title
          .textContent()
          .then((titleRaw) => (titleRaw ? getTrackTitle(titleRaw) : undefined)),

      getAlbum: async () => (await album.textContent()) ?? undefined,

      getArtist: async () => (await artist.textContent()) ?? undefined,

      getDurartion: async () => (await duration.textContent()) ?? undefined,

      play: () => trackLocator.dblclick({ position: { x: 4, y: 4 } }),

      openContextMenu: async () => {
        await trackLocator.click({ button: "right", position: { x: 8, y: 8 } })

        const menu = await createMenuOrganism(electron)
        await menu.menuLocator.waitFor({ state: "visible" })

        return menu
      },

      /**
       * Add to a playlist via the context menu.
       *
       * When `playlist` is `"NEW"` create a new one.
       */
      addToPlaylist: async (playlist: string | "NEW") => {
        await trackLocator.click({ button: "right" })

        await createMenuOrganism(electron).then((menu) =>
          playlist === "NEW"
            ? menu.addToNewPlaylist()
            : menu.addToExistingPlaylist(playlist)
        )
      },
    }
  }
}
