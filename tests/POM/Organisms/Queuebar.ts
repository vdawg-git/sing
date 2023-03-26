/* eslint-disable unicorn/prefer-dom-node-text-content */

import { TEST_ATTRIBUTES, TEST_IDS } from "@sing-renderer/TestConsts"

import type { ElectronApplication, Locator } from "playwright"

import { getTrackTitle } from "#/Helper"

export async function createQueuebarOrganism(electron: ElectronApplication) {
  const page = await electron.firstWindow()

  // prettier-ignore
  const queueBar = page.getByTestId(TEST_IDS.queueBar),
    allItems = queueBar.locator( TEST_ATTRIBUTES.asQuery.queueItem ),
    currentTrack = queueBar.getByTestId(TEST_IDS.queueCurrentTrack),
    currentTrackTitle = currentTrack.getByTestId(TEST_IDS.queueCurrentTrackTitle),
    itemTitles = allItems.locator(TEST_ATTRIBUTES.asQuery.queueItemTitle),
    manuallyAddedItems = queueBar.locator(TEST_ATTRIBUTES.asQuery.queueManuallyAddedTracks),
    nextTrack = queueBar.getByTestId(TEST_IDS.queueNextTrack),
    nextTracks = queueBar.getByTestId(TEST_IDS.queueBarNextTracks),
    playbarQueueIcon = page.getByTestId(TEST_IDS.playbarQueueIcon),
    previousTrack = queueBar.getByTestId(TEST_IDS.queuePreviousTrack)

  return {
    allItems,
    close,
    currentTrack,
    currentTrackTitle,
    getItemByTitle,
    getItemTitles,
    getItemsData,
    getNextTrackData,
    getNextTrackTitle,
    getPreviousTrackData,
    getPreviousTrackTitle,
    getTitles,
    manuallyAddedItems,
    nextTrack,
    nextTracks,
    open,
    playNextTrack,
    previousTrack,
    removeManuallyAddedItemByIndex,
  }

  async function getItemsData() {
    const allItemsLocators = await allItems.all()
    return await Promise.all(allItemsLocators.map(convertLocatorToQueueItem))
  }

  async function getItemTitles() {
    await open()

    const allItemTitles = await itemTitles.all()

    const rawTitles = await Promise.all(
      allItemTitles.map((item) => item.textContent())
    )

    return (rawTitles as string[]).map(getTrackTitle)
  }

  async function getTitles() {
    await open()

    const all = await allItems
      .locator(TEST_ATTRIBUTES.asQuery.queueItemTitle)
      .all()
    return Promise.all(
      all.map(async (item) => {
        const rawTitle = await item.textContent()
        if (!rawTitle) return undefined

        return getTrackTitle(rawTitle)
      })
    )
  }

  async function getItemByTitle(title: string) {
    return allItems.filter({ hasText: title + "_" })
  }

  async function playNextTrack() {
    await open()
    await nextTrack.dblclick()
  }

  async function isQueueOpen() {
    if (await queueBar.isVisible()) return true

    return false
  }

  async function getNextTrackData() {
    await open()
    const data = await convertLocatorToQueueItem(nextTrack)

    return data
  }

  async function getNextTrackTitle() {
    await open()
    return getNextTrackData().then((track) => track.getTitle())
  }

  async function getPreviousTrackTitle() {
    return getPreviousTrackData().then((track) => track.getTitle())
  }

  async function getPreviousTrackData() {
    await open()
    const data = await convertLocatorToQueueItem(previousTrack)

    return data
  }

  async function open() {
    if (await isQueueOpen()) return

    await playbarQueueIcon.click()
    await queueBar.waitFor({ state: "visible" })
  }

  async function close() {
    if (!(await isQueueOpen())) return

    await playbarQueueIcon.click()
    await queueBar.waitFor({ state: "detached" })
  }

  async function removeManuallyAddedItemByIndex(index: number) {
    await manuallyAddedItems
      .nth(index)
      .locator(TEST_ATTRIBUTES.asQuery.queueItemDeleteIcon)
      .click({ force: true })
  }

  async function convertLocatorToQueueItem(wrapper: Locator) {
    const title = wrapper.locator(TEST_ATTRIBUTES.asQuery.queueItemTitle)
    async function getTitle() {
      const trackTitle = await title.innerText()
      return getTrackTitle(trackTitle)
    }

    const cover = wrapper.locator(TEST_ATTRIBUTES.asQuery.queueItemCover)
    function getCover() {
      return cover.innerText()
    }

    const artist = wrapper.locator(TEST_ATTRIBUTES.asQuery.queueItemArtist)
    function getArtist() {
      return artist.innerText()
    }

    return {
      artist,
      cover,
      getArtist,
      getCover,
      getTitle,
      locator: wrapper,
      titleLocator: title,

      async play() {
        await open()
        await wrapper.click({ force: true })
      },
      async remove() {
        await open()
        await wrapper
          .locator(TEST_ATTRIBUTES.asQuery.queueItemDeleteIcon)
          .click({ force: true })
      },
    }
  }
}
