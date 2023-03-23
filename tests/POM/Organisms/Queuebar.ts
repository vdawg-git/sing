/* eslint-disable unicorn/prefer-dom-node-text-content */

import { TEST_ATTRIBUTES, TEST_IDS } from "@sing-renderer/TestConsts"

import type { ElectronApplication, Locator } from "playwright"

import { getTrackTitle } from "#/Helper"

export async function createQueuebarOrganism(electron: ElectronApplication) {
  const page = await electron.firstWindow()

  // prettier-ignore
  const queueBar = page.getByTestId(TEST_IDS.queueBar),
    allItems = queueBar.locator( TEST_ATTRIBUTES.asQuery.queueItem),
    currentTrack = queueBar.getByTestId(TEST_IDS.queueCurrentTrack),
    manuallyAddedItems = queueBar.locator(TEST_ATTRIBUTES.asQuery.queueManuallyAddedTracks),
    nextTrack = queueBar.getByTestId(TEST_IDS.queueNextTrack),
    nextTracks = queueBar.getByTestId(TEST_IDS.queueBarNextTracks),
    playbarQueueIcon = page.getByTestId(TEST_IDS.playbarQueueIcon),
    previousTrack = queueBar.getByTestId(TEST_IDS.queuePreviousTrack)

  return {
    allItems,
    close,
    currentTrack,
    getItemByTitle,
    getNextTrackData,
    getPreviousTrackData,
    manuallyAddedItems,
    nextTrack,
    nextTracks,
    open,
    playNextTrack,
    previousTrack,
  }

  async function getItemByTitle(title: string) {
    return allItems.filter({ hasText: title + "_" })
  }

  async function playNextTrack() {
    await open()
    await nextTrack.dblclick({ timeout: 2000 })
    await close()
  }

  async function isQueueOpen() {
    if (await queueBar.isVisible()) return true

    return false
  }

  async function getNextTrackData() {
    await open()
    const data = await convertLocatorToQueueItem(nextTrack)

    await close()

    return data
  }
  async function getPreviousTrackData() {
    await open()
    const data = await convertLocatorToQueueItem(previousTrack)

    await close()

    return data
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
