import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest"
import * as A from "fp-ts/lib/Array"

import { launchElectron } from "./Helper"
import { createBasePage } from "./POM/BasePage"
import { createTracksPage } from "./POM/TracksPage"

import type { ElectronApplication } from "playwright"

const electron: ElectronApplication = await launchElectron()

beforeAll(async () => {
  const basePage = await createBasePage(electron)

  const libraryPage = await basePage.resetTo.settingsLibrary()
  await libraryPage.resetToDefault()

  await libraryPage.resetTo.tracks()
})

afterAll(async () => {
  await electron.close()
})

beforeEach(async () => {
  const page = await createBasePage(electron)
  await page.reload()
})

it("displays a cover", async () => {
  const tracksPage = await createTracksPage(electron)
  // TODO implement saving queue and play state and restoring it when reopening the app

  expect(await tracksPage.playbar.isRenderingPlaybarCover()).toBe(true)
})

it("does not throw an error when playing a queue item", async () => {
  const tracksPage = await createTracksPage(electron)

  const errorListener = await tracksPage.createErrorListener()
  await tracksPage.queuebar.playNextTrack()

  errorListener.stopListeners()
  expect(errorListener.getErrors()).lengthOf(
    0,
    `Received error when playing a queue item.
  ${errorListener.getErrors().toString()}`
  )
})

it("progresses the seekbar when playing first song", async () => {
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

it("progresses the seekbar when playing second song", async () => {
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

it("changes the current time when when clicking on the seekbar", async () => {
  const tracksPage = await createTracksPage(electron)

  const oldTime = await tracksPage.playbar.getCurrentProgress()

  await tracksPage.playbar.clickSeekbar(50)

  const newTime = await tracksPage.playbar.getCurrentProgress()

  expect(newTime).toBeGreaterThan(oldTime)
})

it("displays the current time when hovering the seekbar", async () => {
  const tracksPage = await createTracksPage(electron)

  await tracksPage.playbar.hoverSeekbar()

  expect(await tracksPage.playbar.getCurrentProgress()).toBe(0)
})

it("displays the total time when hovering the seekbar", async () => {
  const tracksPage = await createTracksPage(electron)

  await tracksPage.playbar.hoverSeekbar()

  expect(await tracksPage.playbar.getTotalDuration()).toBeGreaterThan(0)
})

it("goes to the next track in queue after the current has finished", async () => {
  const tracksPage = await createTracksPage(electron)
  await tracksPage.queuebar.open()

  const oldNextTrack = await tracksPage.queuebar
    .getNextTrack()
    .then((track) => track?.title)

  await tracksPage.playbar.clickSeekbar(97)

  await tracksPage.playbar.clickPlay()
  await tracksPage.waitForCurrentTrackToChangeTo("Next track")

  const newCurrentTrack = await tracksPage.playbar.getCurrentTrack()

  expect(oldNextTrack).toEqual(newCurrentTrack)
})

it("changes the volume when clicking the slider", async () => {
  const tracksPage = await createTracksPage(electron)

  const oldVolume = await tracksPage.playbar.getVolume()

  await tracksPage.playbar.setVolume(0.5)
  const newVolume = await tracksPage.playbar.getVolume()

  expect(newVolume, "It did not change the volume.").not.toBe(oldVolume)
  expect(newVolume).toBeCloseTo(0.5, 1)
})

it("visualizes the volume correctly", async () => {
  const tracksPage = await createTracksPage(electron)

  const internalVolume = await tracksPage.playbar.getVolumeState()
  const sliderHeight = await tracksPage.playbar.getVolume()

  expect(internalVolume).toBeCloseTo(sliderHeight, 1)
})

it("does not play music when paused and going to the previous track", async () => {
  const tracksPage = await createTracksPage(electron)

  await tracksPage.playbar.clickNext()
  await tracksPage.playbar.clickPrevious()

  const isPlaying = await tracksPage.isPlayingAudio()

  expect(isPlaying).toBe(false)
})

it("does not play music when paused and going to the next track", async () => {
  const tracksPage = await createTracksPage(electron)

  await tracksPage.playbar.clickNext()

  const isPlaying = await tracksPage.isPlayingAudio()

  expect(isPlaying).toBe(false)
})

it("does not play music when just opened", async () => {
  const tracksPage = await createTracksPage(electron)

  const isPlaying = await tracksPage.isPlayingAudio()

  expect(isPlaying).toBe(false)
})

it("sets the queue correctly when (un)shuffling", async () => {
  const tracksPage = await createTracksPage(electron)

  await tracksPage.playbar.clickNext()

  const startingTrackPlaybar = await tracksPage.playbar.getCurrentTrack()
  const startingQueue = await tracksPage.queuebar.getTitles()

  const isShuffleOn = await tracksPage.playbar.isShuffleOn()

  isShuffleOn && (await tracksPage.playbar.clickShuffle()) // If shuffle is already on, unset it
  await tracksPage.playbar.clickShuffle()

  const newQueue = await tracksPage.queuebar.getTitles()
  const newCurrentTrackQueue = await tracksPage.queuebar.getCurrentTrack()
  const newCurrentTrackPlaybar = await tracksPage.playbar.getCurrentTrack()

  expect(startingQueue).not.toEqual(newQueue)
  expect(startingTrackPlaybar).toEqual(newCurrentTrackQueue)
  expect(startingTrackPlaybar).toEqual(newCurrentTrackPlaybar)
  expect(startingTrackPlaybar).toEqual(newQueue[0])

  // Unshuffle

  await tracksPage.playbar.clickShuffle()

  const latestQueue = await tracksPage.queuebar.getTitles()

  expect(
    latestQueue,
    `Does not go back to the previous queue, when setting and then unsetting shuffle.`
  ).toEqual(startingQueue)
  expect(latestQueue[1]).toEqual(startingTrackPlaybar)
})

it("does not interuppt playback when clicking shuffle", async () => {
  const tracksPage = await createTracksPage(electron)

  // If shuffle is already on, unset it
  const isShuffleOn = await tracksPage.playbar.isShuffleOn()
  isShuffleOn && (await tracksPage.playbar.clickShuffle())

  await tracksPage.playbar.clickPlay()

  await tracksPage.playbar.clickShuffle()

  const isPlaying = await tracksPage.isPlayingAudio()

  expect(isPlaying).toBe(true)
})

it("does not interuppt playback when unshuffle", async () => {
  const tracksPage = await createTracksPage(electron)

  const isShuffleOn = await tracksPage.playbar.isShuffleOn()
  !isShuffleOn && (await tracksPage.playbar.clickShuffle())

  await tracksPage.playbar.clickPlay()

  await tracksPage.playbar.clickShuffle()

  const isPlaying = await tracksPage.isPlayingAudio()

  expect(isPlaying).toBe(true)
})

describe("when playing a track while shuffle is on", async () => {
  const tracksPage = await createTracksPage(electron)
  const trackToPlay = "01"

  it("should play a track correctly and another on another too", async () => {
    await tracksPage.playbar.clickShuffle()

    await tracksPage.trackList.playTrack(trackToPlay)

    const playingTrack = await tracksPage.playbar.getCurrentTrack()
    expect(playingTrack).toEqual(trackToPlay)

    const newTrackToPlay = "10"
    await tracksPage.trackList.playTrack(newTrackToPlay)
    const newTrack = await tracksPage.playbar.getCurrentTrack()
    expect(newTrack).toEqual(newTrackToPlay)
  })

  it("should set a new random queue from the source", async () => {
    const oldQueue = await tracksPage.queuebar.getItems()

    await tracksPage.playbar.clickShuffle()
    await tracksPage.trackList.playTrack(trackToPlay)

    const newQueue = await tracksPage.queuebar.getItems()

    expect(newQueue.slice(0, 10)).not.toEqual(oldQueue.slice(0, 10))
  })

  it("should not interrupt playback when removing a previous track in the queue", async () => {
    await tracksPage.playbar.clickShuffle()
    await tracksPage.playbar.clickNext()
    await tracksPage.playbar.clickNext()

    await tracksPage.playbar.clickPlay()

    await tracksPage.playbar.waitForDurationToBecome(1)

    await tracksPage.queuebar
      .getPreviousTrack()
      .then((track) => track?.remove())

    const progress = await tracksPage.playbar.getCurrentProgress()

    expect(progress).not.toBe(0)
  })
})

it("should sort the tracks correctly by default by title even when title is not set and the filename is used", async () => {
  const tracksPage = await createTracksPage(electron)
  await tracksPage.reload()

  const tracks = await tracksPage.trackList.getTracks()

  expect(tracks).toEqual(tracks.sort())
})

describe("when playing a track after adding folders from a blank state", async () => {
  beforeEach(async () => {
    const tracksPage = await createTracksPage(electron)
    await tracksPage.resetMusic()
  })

  it("does play the track correctly", async () => {
    const trackToPlay = "10"

    const tracksPage = await createTracksPage(electron)
    const libraryPage = await tracksPage.goTo.settingsLibrary()
    await libraryPage.addFolder(1)
    await libraryPage.saveAndSyncFolders()
    await libraryPage.goTo.tracks()

    await tracksPage.trackList.playTrack(trackToPlay)

    const currentTrack = await tracksPage.playbar.getCurrentTrack()

    expect(currentTrack).to.include(trackToPlay)
  })
})

describe("When seeking", async () => {
  beforeEach(async () => {
    const page = await createTracksPage(electron)
    const settings = await page.resetTo.settingsLibrary()
    await settings.removeAllFolders()
    await settings.addFolder(0)
    await settings.saveAndSyncFolders()
    await page.resetTo.tracks()

    await page.trackList.playTrack("01")
    await page.playbar.clickPause()
  })

  it("does not switch track when seeking to the end while paused", async () => {
    const tracksPage = await createTracksPage(electron)

    const currentTrack = await tracksPage.playbar.getCurrentTrack()

    if (!currentTrack) throw new Error("No current track is set")

    await tracksPage.playbar.seekTo(100)

    const newTrack = await tracksPage.playbar.getCurrentTrack()

    expect(newTrack).to.equal(currentTrack)
  })

  it("does not switch track when seeking to the start while paused", async () => {
    const tracksPage = await createTracksPage(electron)

    const currentTrack = await tracksPage.playbar.getCurrentTrack()

    if (!currentTrack) throw new Error("No current track is set")

    await tracksPage.playbar.seekTo(10)
    await tracksPage.playbar.seekTo(0)

    const newTrack = await tracksPage.playbar.getCurrentTrack()

    expect(newTrack).to.equal(currentTrack)
  })

  it("updates the current duration", async () => {
    const tracksPage = await createTracksPage(electron)

    const currentProgress = await tracksPage.playbar.getCurrentProgress()

    await tracksPage.playbar.seekTo(99)

    const newProgress = await tracksPage.playbar.getCurrentProgress()

    expect(newProgress).not.to.equal(currentProgress)
  })

  it("pauses the playback while seeking", async () => {
    const tracksPage = await createTracksPage(electron)

    await tracksPage.playbar.clickPlay()

    const getHasPaused = await tracksPage.listenToPause()

    await tracksPage.playbar.seekTo(99)

    const hasPaused = await getHasPaused()

    expect(hasPaused).toBe(true)
  })

  it("continues the playback after seeking", async () => {
    const tracksPage = await createTracksPage(electron)

    await tracksPage.playbar.clickPlay()

    await tracksPage.playbar.seekTo(99)

    const isPlaying = await tracksPage.isPlayingAudio()

    expect(isPlaying).toBe(true)
  })
})

describe("Queue", async () => {
  it("correctly removes tracks from the queue on user interaction", async () => {
    const tracksPage = await createTracksPage(electron)

    const toRemoveIndexes = [1, 1, 1, 1, 1]

    for (const index of toRemoveIndexes) {
      const queue = await tracksPage.queuebar.getItems()
      const titles = queue.map((item) => item.title)

      await queue.at(index)?.remove()

      const newQueue = await tracksPage.queuebar.getTitles()
      expect(
        newQueue,
        "It should have deleted tracks in order after `00`"
      ).not.to.include(titles.at(index))
    }
  })
})

describe("Mediakey handler", async () => {
  beforeEach(async () => {
    const page = await createTracksPage(electron)
    await page.resetTo.tracks()
  })

  it("correctly sets the mediaSession metadata", async () => {
    const tracksPage = await createTracksPage(electron)
    await tracksPage.reload()

    const titleToPlay = "01"

    await tracksPage.trackList.playTrack(titleToPlay)

    const data = await tracksPage.getMediaSessionMetaData()

    if (!data.metadata || !data.playbackState)
      throw new Error("mediaSession data is not set")

    expect(data.metadata.title).toBe(titleToPlay)
    expect(data.playbackState).toBe(
      "playing" satisfies MediaSessionPlaybackState
    )
    expect(data.metadata.artist).toBe(
      await tracksPage.playbar.getCurrentArtist()
    )
  })
})

describe("Manual queue", async () => {
  const tracksPage = await createTracksPage(electron)

  it("should manipulate the items correctly", async () => {
    const firstTitle = "01"

    await tracksPage.trackList
      .getTrackItem(firstTitle)
      .then((track) => track.openContextMenu())
      .then((menu) => menu.clickPlayNext())

    const queue1 = await tracksPage.queuebar
      .getManuallyAddedTracks()
      .then(A.map((item) => item.title))

    expect(
      queue1,
      "`Play next` did not add to the manual queue correctly"
    ).toEqual([firstTitle])

    const secondTitle = "02"

    await tracksPage.trackList
      .getTrackItem(secondTitle)
      .then((track) => track.openContextMenu())
      .then((menu) => menu.clickPlayNext())

    const queue2 = await tracksPage.queuebar
      .getManuallyAddedTracks()
      .then(A.map((item) => item.title))

    expect(
      queue2,
      "`Play next` did not add to the manual queue correctly"
    ).toEqual([secondTitle, firstTitle])

    const thirdTitle = "03"

    await tracksPage.trackList
      .getTrackItem(thirdTitle)
      .then((track) => track.openContextMenu())
      .then((menu) => menu.clickPlayLater())

    const queue3 = await tracksPage.queuebar.getManuallyAddedTracks()

    expect(
      queue3.map((item) => item.title),
      "`Play later` did not add to the manual queue correctly"
    ).toEqual([secondTitle, firstTitle, thirdTitle])

    await queue3.at(1)?.remove()

    const queue4 = await tracksPage.queuebar
      .getManuallyAddedTracks()
      .then(A.map((item) => item.title))

    expect(
      queue4,
      "Removing a manual queue item did not work properly"
    ).toEqual([secondTitle, thirdTitle])
  })
})

// Currently MediaKeys are not supported. See: https://github.com/microsoft/playwright/issues/20277

// it("does switch the track when the `forward` media key is pressed", async () => {
//   const tracksPage = await createTracksPage(electron)

//   await tracksPage.logPressedKeys()

//   await tracksPage.trackList.playTrack("01")

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
