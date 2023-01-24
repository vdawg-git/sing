/* eslint-disable unicorn/prefer-dom-node-text-content */

import {
  TEST_ATTRIBUTES,
  TEST_IDS,
} from "../../../packages/renderer/src/TestConsts"
import { getTrackTitle, reduceTitlesToFolders } from "../Helper"

import type { ElectronApplication } from "playwright"

export async function createQueuebarOrganism(electron: ElectronApplication) {
  const page = await electron.firstWindow()

  const currentTrack = page.locator(TEST_IDS.asQuery.queueCurrentTrack),
    nextQueueTrack = page.locator(TEST_IDS.asQuery.queueNextTrack),
    nextTrack = page.locator(TEST_IDS.asQuery.queueNextTrack),
    nextTracks = page.locator(TEST_IDS.asQuery.queueBarNextTracks),
    playbarQueueIcon = page.locator(TEST_IDS.asQuery.playbarQueueIcon),
    previousTrack = page.locator(TEST_IDS.asQuery.queuePreviousTrack),
    queueBar = page.locator(TEST_IDS.asQuery.queueBar)
  // , previousTracks = page.locator(TEST_IDS.asQuery.queuePlayedTracks)

  return {
    close,
    getAddedFolders,
    getCurrentTrack,
    getItems,
    getNextTrack,
    getNextTracks,
    getPreviousTrack,
    open,
    playNextTrack,
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
    return nextTracks
  }

  /**
   * Returns the next track title like `02`
   *
   * Returns undefined if there is none
   */
  async function getNextTrack(): Promise<string | undefined> {
    if (!(await isQueueOpen())) await open()

    const element = await nextTrack.elementHandle({ timeout: 2000 })

    if (!element) return undefined

    const titleElement = await element.$(TEST_ATTRIBUTES.asQuery.queueItemTitle)

    if (!titleElement)
      throw new Error("titleElement of track in getNextTrack not found")

    const title = getTrackTitle(await titleElement?.innerText())

    await close()

    return title
  }

  /**
   * Returns the previous track title like `01`.
   *
   * Returns undefined if there is none
   */
  async function getPreviousTrack(): Promise<string | undefined> {
    const element = await previousTrack.elementHandle({ timeout: 2000 })

    if (!element) return undefined

    const titleElement = await element.$(TEST_ATTRIBUTES.asQuery.queueItemTitle)

    if (!titleElement)
      throw new Error("titleElement of track in getPreviousTrack not found")

    return getTrackTitle(await titleElement.innerText())
  }

  async function getItems() {
    await open()

    const queueItems = await page.$$(TEST_ATTRIBUTES.asQuery.queueItem)

    const items = await Promise.all(
      queueItems.map(async (item) => {
        const [titleElement, coverElement, artistElement] = [
          await item.$(TEST_ATTRIBUTES.asQuery.queueItemTitle),
          await item.$(TEST_ATTRIBUTES.asQuery.queueItemCover),
          await item.$(TEST_ATTRIBUTES.asQuery.queueItemArtist),
        ]
        const title = await titleElement?.innerText().then(getTrackTitle)
        const cover = await coverElement?.innerText()
        const artist = await artistElement?.innerText()

        return {
          title,
          cover,
          artist,
        }
      })
    )

    await close()

    return items
  }

  /**
   *
   * @returns The folder numbers.
   * For example: [1, 2, 3] which means all three folders are represented in the queue.
   */
  async function getAddedFolders() {
    const items = await getItems()

    const folders = reduceTitlesToFolders(items.map((item) => item.title))

    return folders
  }

  async function getCurrentTrack() {
    await open()

    const title = currentTrack.innerText({ timeout: 600 }).then(getTrackTitle)

    await close()

    return title
  }
}
