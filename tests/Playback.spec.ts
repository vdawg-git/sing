/* eslint-disable unicorn/prefer-dom-node-text-content */
import { expect, test } from "@playwright/test"

import type { ElectronApplication } from "playwright"

import { launchElectron } from "#/Helper"
import { createBasePage } from "#pages/BasePage"
import { createTracksPage } from "#pages/TracksPage"

let electron: ElectronApplication

test.beforeAll(async () => {
  electron = await launchElectron()

  const basePage = await createBasePage(electron)

  const libraryPage = await basePage.resetTo.settingsLibrary()
  await libraryPage.resetToDefault()

  await libraryPage.resetTo.tracks()
})

test.afterAll(async () => {
  await electron.close()
})

test.beforeEach(async () => {
  const page = await createBasePage(electron)
  await page.reload()
})

test.afterEach(async () => {
  const page = await createBasePage(electron)
  await page.queuebar.close()
})

test("displays a cover", async () => {
  const tracksPage = await createTracksPage(electron)
  // TODO implement saving queue and play state and restoring it when reopening the app

  expect(await tracksPage.playbar.isRenderingPlaybarCover()).toBe(true)
})

test("does not throw an error when playing a queue item", async () => {
  const tracksPage = await createTracksPage(electron)

  const errorListener = await tracksPage.createErrorListener()
  await tracksPage.queuebar.playNextTrack()

  const errorMessage = `Received error when playing a queue item.\n${errorListener
    .getErrors()
    .toString()}`

  errorListener.stopListeners()
  expect(errorListener.getErrors(), errorMessage).toHaveLength(0)
})

test("progresses the seekbar when playing first song", async () => {
  const tracksPage = await createTracksPage(electron)

  const oldWidth = await tracksPage.playbar.getProgressBarWidth()

  await tracksPage.playbar.clickPlay()

  if (oldWidth !== 0)
    throw new Error(
      `Beginning width of progressesBar is not 0, but ${oldWidth}`
    )
  await tracksPage.playbar.waitForProgressBarToProgress(oldWidth)

  const newWidth = await tracksPage.playbar.getProgressBarWidth()

  if (oldWidth === undefined) throw new Error("oldWidth is undefined") // for typescript
  if (newWidth === undefined) throw new Error("newWidth is undefined")

  expect(newWidth).toBeGreaterThan(oldWidth)
})

test("progresses the seekbar when playing second song", async () => {
  const tracksPage = await createTracksPage(electron)

  const oldWidth = await tracksPage.playbar.getProgressBarWidth()

  await tracksPage.playbar.clickNext()
  await tracksPage.playbar.clickPlay()

  if (oldWidth !== 0)
    throw new Error(
      `Beginning width of progressesBar is not 0, but ${oldWidth}`
    )
  await tracksPage.playbar.waitForProgressBarToProgress(oldWidth)

  const newWidth = await tracksPage.playbar.getProgressBarWidth()

  if (oldWidth === undefined) throw new Error("oldWidth is undefined") // for typescript
  if (newWidth === undefined) throw new Error("newWidth is undefined")

  expect(newWidth).toBeGreaterThan(oldWidth)
})

test("changes the current time when when clicking on the seekbar", async () => {
  const tracksPage = await createTracksPage(electron)

  const oldTime = await tracksPage.playbar.getCurrentTime()

  await tracksPage.playbar.clickSeekbar(50)

  const newTime = await tracksPage.playbar.getCurrentTime()

  expect(newTime).toBeGreaterThan(oldTime)
})

test("displays the current time when hovering the seekbar", async () => {
  const tracksPage = await createTracksPage(electron)

  await tracksPage.playbar.hoverSeekbar()

  expect(await tracksPage.playbar.getCurrentTime()).toBe(0)
})

test("displays the total time when hovering the seekbar", async () => {
  const tracksPage = await createTracksPage(electron)

  await tracksPage.playbar.hoverSeekbar()

  expect(await tracksPage.playbar.getTotalDuration()).toBeGreaterThan(0)
})

test("goes to the next track in queue after the current has finished", async () => {
  const tracksPage = await createTracksPage(electron)
  await tracksPage.queuebar.open()

  const nextTitle = await tracksPage.queuebar.getNextTrackTitle()

  await tracksPage.playbar.clickSeekbar(97)

  await tracksPage.playbar.clickPlay()

  const newCurrentTrack = tracksPage.playbar.currentTrackTitle

  await expect(newCurrentTrack).toContainText(nextTitle, { timeout: 2000 })
})

test("changes the volume when clicking the slider", async () => {
  const tracksPage = await createTracksPage(electron)

  const oldVolume = await tracksPage.playbar.getVolume()

  await tracksPage.playbar.setVolume(0.5)
  const newVolume = await tracksPage.playbar.getVolume()

  expect(newVolume, "It did not change the volume.").not.toBe(oldVolume)
  expect(newVolume).toBeCloseTo(0.5, 1)
})

test("visualizes the volume correctly", async () => {
  const tracksPage = await createTracksPage(electron)

  const internalVolume = await tracksPage.playbar.getVolumeState()
  const sliderHeight = await tracksPage.playbar.getVolume()

  expect(internalVolume).toBeCloseTo(sliderHeight, 1)
})

test("does not play music when paused and going to the previous track", async () => {
  const tracksPage = await createTracksPage(electron)

  await tracksPage.playbar.clickNext()
  await tracksPage.playbar.clickPrevious()

  const isPlaying = await tracksPage.isPlayingAudio()

  expect(isPlaying).toBe(false)
})

test("does not play music when paused and going to the next track", async () => {
  const tracksPage = await createTracksPage(electron)

  await tracksPage.playbar.clickNext()

  const isPlaying = await tracksPage.isPlayingAudio()

  expect(isPlaying).toBe(false)
})

test("does not play music when just opened", async () => {
  const tracksPage = await createTracksPage(electron)

  const isPlaying = await tracksPage.isPlayingAudio()

  expect(isPlaying).toBe(false)
})

test("sets the queue correctly when (un)shuffling", async () => {
  const tracksPage = await createTracksPage(electron)

  const oldTitle = await tracksPage.playbar.currentTrackTitle.textContent()
  if (!oldTitle) throw new Error(`The current track is not set `)

  await tracksPage.playbar.clickNext()
  await expect(
    tracksPage.playbar.currentTrackTitle,
    "Clicking next did not change the track"
  ).not.toContainText(oldTitle)

  const nextOldCurrentTitle =
    await tracksPage.playbar.currentTrackTitle.innerText()
  const startingQueue = await tracksPage.queuebar.getTitles()

  await tracksPage.queuebar.open()

  const oldNextTrackTitle = await tracksPage.queuebar.getNextTrackTitle()

  const isShuffleOn = await tracksPage.playbar.isShuffleOn()

  isShuffleOn && (await tracksPage.playbar.clickShuffle()) // If shuffle is already on, unset it
  await tracksPage.playbar.clickShuffle()

  await expect(tracksPage.queuebar.nextTrack).not.toContainText(
    oldNextTrackTitle
  )

  const newQueue = await tracksPage.queuebar.getTitles()

  await tracksPage.queuebar.open()

  const newCurrentTitleFromQueue =
    await tracksPage.queuebar.currentTrackTitle.textContent()
  const newCurrentTitlePlaybar =
    await tracksPage.playbar.currentTrackTitle.textContent()

  expect(startingQueue).not.toEqual(newQueue)
  expect(newCurrentTitleFromQueue).toContain(nextOldCurrentTitle)
  expect(nextOldCurrentTitle).toContain(newCurrentTitleFromQueue)
  expect(nextOldCurrentTitle).toContain(newCurrentTitlePlaybar)
  expect(nextOldCurrentTitle).toContain(newQueue[0])

  // Unshuffle
  await tracksPage.playbar.clickShuffle()

  await expect(
    tracksPage.queuebar.nextTrack,
    "Failed to unshuffle correctly. The next track has not been restored to its previous value."
  ).toContainText(oldNextTrackTitle)

  const latestQueue = await tracksPage.queuebar.getTitles()

  expect(
    latestQueue,
    `Failed to go back to the previous queue, when setting and then unsetting shuffle.`
  ).toEqual(startingQueue)
  expect(nextOldCurrentTitle).toContain(latestQueue[1])
})

test("does not interuppt playback when clicking shuffle", async () => {
  const tracksPage = await createTracksPage(electron)

  // If shuffle is already on, unset it
  const isShuffleOn = await tracksPage.playbar.isShuffleOn()
  isShuffleOn && (await tracksPage.playbar.clickShuffle())

  await tracksPage.playbar.clickPlay()

  await tracksPage.playbar.clickShuffle()

  const isPlaying = await tracksPage.isPlayingAudio()

  expect(isPlaying).toBe(true)
})

test("does not interuppt playback when unshuffle", async () => {
  const tracksPage = await createTracksPage(electron)

  const isShuffleOn = await tracksPage.playbar.isShuffleOn()
  !isShuffleOn && (await tracksPage.playbar.clickShuffle())

  await tracksPage.playbar.clickPlay()

  await tracksPage.playbar.clickShuffle()

  const isPlaying = await tracksPage.isPlayingAudio()

  expect(isPlaying).toBe(true)
})

test.describe("when playing a track while shuffle is on", async () => {
  const trackToPlay = "01_"

  test("should play a track correctly and another on another too", async () => {
    const tracksPage = await createTracksPage(electron)
    await tracksPage.playbar.clickShuffle()

    await tracksPage.trackList.playTrack(trackToPlay)

    await expect(tracksPage.playbar.currentTrackTitle).toContainText(
      trackToPlay
    )

    const newTrackToPlay = "10_"
    await tracksPage.trackList.playTrack(newTrackToPlay)

    await expect(tracksPage.playbar.currentTrackTitle).toContainText(
      newTrackToPlay
    )
  })

  test("should set a new random queue from the source", async () => {
    const tracksPage = await createTracksPage(electron)
    const oldQueue = await tracksPage.queuebar.getItemTitles()

    await tracksPage.playbar.clickShuffle()

    await expect(async () => {
      const items = await tracksPage.queuebar.getItemTitles()

      expect(items).not.toEqual(oldQueue)
    }, "Failed to set shuffle. Queue titles stayed in the same order.").toPass({
      timeout: 3000,
    })

    await tracksPage.trackList.playTrack(trackToPlay)

    await expect(
      tracksPage.playbar.currentTrackTitle,
      "Failed to play track"
    ).toContainText(trackToPlay)

    const newQueue = await tracksPage.queuebar.getItemTitles()

    expect(newQueue.slice(0, 10)).not.toEqual(oldQueue.slice(0, 10))
  })

  test("should not interrupt playback when removing a previous track in the queue", async () => {
    const tracksPage = await createTracksPage(electron)
    await tracksPage.playbar.clickShuffle()
    await tracksPage.playbar.clickNext()
    await tracksPage.playbar.clickNext()

    await tracksPage.playbar.clickPlay()

    await tracksPage.playbar.waitForProgessToBecome(1)

    await tracksPage.playbar.clickPause()

    await tracksPage.queuebar
      .getPreviousTrackData()
      .then((item) => item.remove())

    const progress = await tracksPage.playbar.getCurrentTime()

    expect(progress).not.toBe(0)
  })
})

test("should sort the tracks correctly by title even when title is not set and the filename is used", async () => {
  const tracksPage = await createTracksPage(electron)
  await tracksPage.reload()

  const tracks = await tracksPage.trackList.getTrackTitles()

  expect(tracks).toEqual(tracks.sort())
})

test.describe("when playing a track after adding folders from a blank state", async () => {
  test.beforeEach(async () => {
    const page = await createBasePage(electron)
    const settingsPage = await page.goTo.settingsLibrary()
    await settingsPage.emptyLibrary()
    await settingsPage.goTo.tracks()
  })

  test("does play the track correctly", async () => {
    const trackToPlay = "10"

    const tracksPage = await createTracksPage(electron)
    const libraryPage = await tracksPage.goTo.settingsLibrary()
    await libraryPage.addFolder(1)
    await libraryPage.saveAndSyncFolders()
    await libraryPage.goTo.tracks()

    await tracksPage.trackList.playTrack(trackToPlay)

    await expect(tracksPage.playbar.currentTrackTitle).toContainText(
      trackToPlay
    )
  })
})

test.describe("When seeking", async () => {
  test.beforeEach(async () => {
    const page = await createTracksPage(electron)
    const settings = await page.resetTo.settingsLibrary()
    await settings.removeAllFolders()
    await settings.addFolder(0)
    await settings.saveAndSyncFolders()
    await page.resetTo.tracks()

    await page.trackList.playTrack("01_")
    await page.playbar.clickPause()
  })

  test("does not switch track when seeking to the end while paused", async () => {
    const tracksPage = await createTracksPage(electron)

    const oldTrack = await tracksPage.playbar.currentTrackTitle.textContent()

    if (!oldTrack) throw new Error("No current track is set")

    await tracksPage.playbar.seekTo(100)

    const newTrack = tracksPage.playbar.currentTrackTitle

    await expect(newTrack).toHaveText(oldTrack)
  })

  test("does not switch track when seeking to the start while paused", async () => {
    const tracksPage = await createTracksPage(electron)

    const oldTrack = await tracksPage.playbar.currentTrackTitle.textContent()

    if (!oldTrack) throw new Error("No current track is set")

    await tracksPage.playbar.seekTo(10)
    await tracksPage.playbar.seekTo(0)

    const newTrack = tracksPage.playbar.currentTrackTitle

    await expect(newTrack).toHaveText(oldTrack)
  })

  test("updates the current duration", async () => {
    const tracksPage = await createTracksPage(electron)

    const currentProgress = await tracksPage.playbar.getCurrentTime()

    await tracksPage.playbar.seekTo(99)

    const newProgress = await tracksPage.playbar.getCurrentTime()

    expect(newProgress).not.toEqual(currentProgress)
  })

  test("pauses the playback while seeking", async () => {
    const tracksPage = await createTracksPage(electron)

    await tracksPage.playbar.clickPlay()

    const getHasPaused = await tracksPage.listenToPause()

    await tracksPage.playbar.seekTo(99)

    const hasPaused = await getHasPaused()

    expect(hasPaused).toBe(true)
  })

  test("continues the playback after seeking", async () => {
    const tracksPage = await createTracksPage(electron)

    await tracksPage.playbar.clickPlay()

    await tracksPage.playbar.seekTo(99)

    const isPlaying = await tracksPage.isPlayingAudio()

    expect(isPlaying).toBe(true)
  })
})

test.describe("Queue", async () => {
  test("correctly removes tracks from the queue on user interaction", async () => {
    const tracksPage = await createTracksPage(electron)

    const toRemoveIndexes = [1, 1, 1, 1, 1]

    for (const index of toRemoveIndexes) {
      const queue = await tracksPage.queuebar.getItemsData()
      const titles = await Promise.all(queue.map((item) => item.getTitle()))

      await queue.at(index)?.remove()

      await expect(
        await tracksPage.queuebar.getItemByTitle(titles[index])
      ).toBeHidden()
    }
  })
})

test.describe("Mediakey handler", async () => {
  test.beforeEach(async () => {
    const page = await createTracksPage(electron)
    await page.resetTo.tracks()
  })

  test("correctly sets the mediaSession metadata", async () => {
    const tracksPage = await createTracksPage(electron)
    await tracksPage.reload()

    const titleToPlay = "01_"

    await tracksPage.trackList.playTrack(titleToPlay)

    const data = await tracksPage.getMediaSessionMetaData()

    if (!data.metadata || !data.playbackState)
      throw new Error("mediaSession data is not set")

    expect(titleToPlay).toContain(data.metadata.title)
    expect(data.playbackState).toBe(
      "playing" satisfies MediaSessionPlaybackState
    )
    expect(data.metadata.artist).toBe(
      await tracksPage.playbar.currentArtist.textContent()
    )
  })
})

test.describe("Manual queue", async () => {
  test("should manipulate the items correctly", async () => {
    const tracksPage = await createTracksPage(electron)
    const firstTitle = "01_"

    await tracksPage.trackList
      .getTrackItem(firstTitle)
      .then((track) => track.openContextMenu())
      .then((menu) => menu.clickPlayNext())

    await tracksPage.queuebar.open()

    await expect(
      tracksPage.queuebar.manuallyAddedItems.filter({ hasText: firstTitle }),
      "`Play next` failed to add to the manual queue correctly"
    ).toBeVisible({ timeout: 2000 })

    const secondTitle = "02"

    await tracksPage.trackList
      .getTrackItem(secondTitle)
      .then((track) => track.openContextMenu())
      .then((menu) => menu.clickPlayNext())

    await expect(
      tracksPage.queuebar.manuallyAddedItems
        .nth(0)
        .filter({ hasText: secondTitle }),
      "`Play next` failed to add to the manual queue correctly when done twice"
    ).toBeVisible({ timeout: 2000 })

    const thirdTitle = "03"

    await tracksPage.trackList
      .getTrackItem(thirdTitle)
      .then((track) => track.openContextMenu())
      .then((menu) => menu.clickPlayLater())

    await expect(
      tracksPage.queuebar.manuallyAddedItems
        .nth(2)
        .filter({ hasText: thirdTitle }),
      "`Play later` failed to add to the manual queue correctly"
    ).toBeVisible({ timeout: 2000 })

    await tracksPage.queuebar.removeManuallyAddedItemByIndex(1)

    await expect(
      tracksPage.queuebar.manuallyAddedItems.filter({ hasText: firstTitle }),
      "Failed to remove a manual queue item."
    ).toBeHidden({ timeout: 2000 })
  })
})

// Currently MediaKeys are not supported. See: https://github.com/microsoft/playwright/issues/20277

// it("does switch the track when the `forward` media key is pressed", async () => {
//   const tracksPage = await createTracksPage(electron)

//   await tracksPage.logPressedKeys()

//   await tracksPage.trackList.playTrack("01_")

//   const oldTrack = await tracksPage.playbar.getCurrentTrack()

//   const desiredTrack = await tracksPage.queuebar.getNextTrack()

//   if (!oldTrack) throw new Error("No current track is set")

//   await tracksPage.pressMediaKey("MediaTrackNext")

//   const newTrack = await tracksPage.playbar.getCurrentTrack()

//   expect(newTrack).not.toEqual(oldTrack)
//   expect(newTrack).toEqual(desiredTrack)
// })

// it("does switch the track when the `previous` media key is pressed", async () => {
//   const tracksPage = await createTracksPage(electron)

// await tracksPage.playbar.clickNext()

// const oldTrack = await tracksPage.playbar.getCurrentTrack()

// await tracksPage.queuebar.open()
// const desiredTrack = await tracksPage.queuebar.getPreviousTrack()

// if (!oldTrack) throw new Error("No current track is set")

// await tracksPage.pressMediaKey("MediaStop")

// const newTrack = await tracksPage.playbar.getCurrentTrack()

// expect(newTrack).not.toEqual(oldTrack)
// expect(newTrack).toEqual(desiredTrack)
// })

// it("does pauses when the `togglePlayback` media key is pressed when its currently playing", async () => {
//   const tracksPage = await createTracksPage(electron)

//   await tracksPage.pressMediaKey("MediaPause")

//   const isPlaying = await tracksPage.isPlayingAudio()

//   expect(isPlaying).toBe(true)
// })

// it("does pauses when the `togglePlayback` media key is pressed when its currently playing", async () => {
//   const tracksPage = await createTracksPage(electron)

// await tracksPage.playbar.clickPlay()

//   await tracksPage.pressMediaKey("MediaPlay")

//   const isPlaying = await tracksPage.isPlayingAudio()

//   expect(isPlaying).toEqual(false)
// })
// })
