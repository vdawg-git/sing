/* eslint-disable unicorn/prefer-dom-node-text-content */

import * as A from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/function"

import {
  TEST_ATTRIBUTES,
  TEST_IDS,
} from "../../../packages/renderer/src/TestConsts"
import { getFolderFromTitle, getTrackTitle } from "../Helper"
import { removeDuplicates } from "../../../packages/shared/Pures"

import type { ElectronApplication, Locator } from "playwright"

export async function createQueuebarOrganism(electron: ElectronApplication) {
  const page = await electron.firstWindow()

  // prettier-ignore
  const queueBar = page.getByTestId(TEST_IDS.queueBar),
    allItems = queueBar.locator(TEST_ATTRIBUTES.asQuery.queueItem),
    currentTrack = queueBar.getByTestId(TEST_IDS.queueCurrentTrack),
    manuallyAddedItems = queueBar.locator(TEST_ATTRIBUTES.asQuery.queueManuallyAddedTracks),
    nextQueueTrack = queueBar.getByTestId(TEST_IDS.queueNextTrack),
    nextTrack = queueBar.getByTestId(TEST_IDS.queueNextTrack),
    nextTracks = queueBar.getByTestId(TEST_IDS.queueBarNextTracks),
    previousTrack = queueBar.getByTestId(TEST_IDS.queuePreviousTrack),

    playbarQueueIcon = page.getByTestId(TEST_IDS.playbarQueueIcon)

  // , previousTracks = page.getByTestId(TEST_IDS.queuePlayedTracks)

  return {
    close,
    getAddedFolders,
    getCurrentTrack,
    getItems,
    getManuallyAddedTracks,
    getNextTrack,
    getNextTracks,
    getPreviousTrack,
    getTitles,
    open,
    playNextTrack,
  }

  async function getManuallyAddedTracks() {
    await open()

    const tracks = await Promise.all(
      await manuallyAddedItems.all().then(A.map(convertLocatorToQueueItem))
    )

    await close()

    return tracks
  }

  async function playNextTrack() {
    await nextQueueTrack.dblclick({ timeout: 2000 })
  }

  async function isQueueOpen() {
    if (await queueBar.isVisible()) return true

    return false
  }

  async function open() {
    if (await isQueueOpen()) return

    await playbarQueueIcon.click({ timeout: 1500 })
    await queueBar.waitFor({ state: "visible", timeout: 5000 })
  }

  async function close() {
    if (!isQueueOpen()) return

    await playbarQueueIcon.click({ timeout: 1500 })
    await queueBar.waitFor({ state: "detached", timeout: 5000 })
  }

  async function getNextTracks() {
    await open()

    const tracks = Promise.all(
      await nextTracks.all().then(A.map(convertLocatorToQueueItem))
    )

    await close()

    return tracks
  }

  /**
   * Returns the next track title like `02`
   *
   * Returns undefined if there is none
   */
  async function getNextTrack() {
    await open()

    const result = (await nextTrack.isVisible())
      ? await convertLocatorToQueueItem(nextTrack)
      : undefined

    await close()

    return result
  }

  /**
   * Returns the previous track title like `01`.
   *
   * Returns undefined if there is none
   */
  async function getPreviousTrack() {
    await open()

    const result = (await previousTrack.isVisible())
      ? await convertLocatorToQueueItem(previousTrack)
      : undefined

    await close()

    return result
  }

  async function getItems() {
    await open()

    const items = await Promise.all(
      await allItems.all().then(A.map(convertLocatorToQueueItem))
    )

    await close()

    return items
  }

  async function getTitles() {
    return getItems().then(A.map((item) => item.title))
  }

  /**
   *
   * @returns The folder numbers.
   * For example: [1, 2, 3] which means all three folders are represented in the queue.
   */
  async function getAddedFolders() {
    const items = await getItems()

    return pipe(
      items,
      A.map((item) => item.title),
      A.map(getFolderFromTitle),
      (folders) => folders.filter(removeDuplicates)
    )
  }

  async function getCurrentTrack() {
    await open()

    const title = currentTrack.innerText({ timeout: 600 }).then(getTrackTitle)

    await close()

    return title
  }

  async function convertLocatorToQueueItem(wrapper: Locator) {
    const title = await wrapper
      .locator(TEST_ATTRIBUTES.asQuery.queueItemTitle)
      .innerText()
      .then(getTrackTitle)
    const cover = await wrapper
      .locator(TEST_ATTRIBUTES.asQuery.queueItemCover)
      .innerText()
    const artist = await wrapper
      .locator(TEST_ATTRIBUTES.asQuery.queueItemArtist)
      .innerText()

    return {
      title,
      cover,
      artist,

      async play() {
        await open()
        await wrapper.click({ timeout: 600, force: true })
        await close()
      },
      async remove() {
        await open()
        await wrapper
          .locator(TEST_ATTRIBUTES.asQuery.queueItemDeleteIcon)
          .click({ timeout: 600, force: true })
        await close()
      },
    }
  }
}
