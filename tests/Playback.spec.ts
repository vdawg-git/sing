import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest"

import { launchElectron } from "./Helper"
import { createBasePage } from "./POM/BasePage"
import { createTracksPage } from "./POM/TracksPage"

import type { ElectronApplication } from "playwright"

let electron: ElectronApplication

beforeAll(async () => {
  electron = await launchElectron()

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
  await tracksPage.queuebar.open()

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

  const oldNextTrack = await tracksPage.queuebar.getNextTrack()

  await tracksPage.playbar.clickSeekbar(97)

  await tracksPage.playbar.clickPlay()
  await tracksPage.waitForCurrentTrackToChangeTo("Next track")

  const newCurrentTrack = await tracksPage.playbar.getCurrentTrack()

  expect(oldNextTrack).toBe(newCurrentTrack)
})

it("changes the volume when clicking the slider", async () => {
  const tracksPage = await createTracksPage(electron)

  const oldVolume = await tracksPage.playbar.getVolume()

  await tracksPage.playbar.setVolume(0.5)
  const newVolume = await tracksPage.playbar.getVolume()

  expect(newVolume).not.toBe(oldVolume)
  expect(newVolume).toBeCloseTo(0.5, 1)
}, 50_000)

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

  const currentTrackPlaybar = await tracksPage.playbar.getCurrentTrack()
  const currentQueue = await tracksPage.queuebar.getItems()

  const isShuffleOn = await tracksPage.playbar.isShuffleOn()

  isShuffleOn && (await tracksPage.playbar.clickShuffle()) // If shuffle is already on, unset it
  await tracksPage.playbar.clickShuffle()

  const newQueue = await tracksPage.queuebar.getItems()
  const newCurrentTrackQueue = await tracksPage.queuebar.getCurrentTrack()
  const newCurrentTrackPlaybar = await tracksPage.playbar.getCurrentTrack()

  expect(currentQueue).not.toEqual(newQueue)
  expect(currentTrackPlaybar).toEqual(newCurrentTrackQueue)
  expect(currentTrackPlaybar).toEqual(newCurrentTrackPlaybar)
  expect(currentTrackPlaybar).toEqual(newQueue[0].title)

  // Unshuffle

  await tracksPage.playbar.clickShuffle()

  const latestQueue = await tracksPage.queuebar.getItems()

  expect(latestQueue).toEqual(currentQueue)
  expect(latestQueue[1].title).toEqual(currentTrackPlaybar)
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

it("plays the clicked track in the list when shuffle is on", async () => {
  const tracksPage = await createTracksPage(electron)

  const trackToPlay = "01"

  // Do it multiple times because this has randomness.
  for (const _ of Array.from({ length: 6 })) {
    const isShuffleOn = await tracksPage.playbar.isShuffleOn()
    !isShuffleOn && (await tracksPage.playbar.clickShuffle())

    await tracksPage.playTrack("01")

    const currentTrack = await tracksPage.playbar.getCurrentTrack()

    expect(currentTrack).toEqual(trackToPlay)
  }
})

it("should sort the tracks correctly by default by title even when title is not set and the filename is used", async () => {
  const tracksPage = await createTracksPage(electron)
  await tracksPage.reload()

  const tracks = await tracksPage.getTracks()

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

    await tracksPage.playTrack(trackToPlay)

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

    await page.playTrack("01")
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
  }, 9_999_999)

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

describe("Mediakey handler", async () => {
  beforeEach(async () => {
    const page = await createTracksPage(electron)
    await page.resetTo.tracks()
  })

  it("correctly sets the mediaSession metadata", async () => {
    const tracksPage = await createTracksPage(electron)
    await tracksPage.reload()

    const title = "01"

    await tracksPage.playTrack(title)

    const data = await tracksPage.getMediaSessionMetaData()

    if (!data.metadata || !data.playbackState)
      throw new Error("mediaSession data is not set")

    expect(data.metadata.title).toBe(title)
    expect(data.playbackState).toBe(
      "playing" satisfies MediaSessionPlaybackState
    )
    expect(data.metadata.artist).toBe(
      await tracksPage.playbar.getCurrentArtist()
    )
  })

  // Currently MediaKeys are not supported. See: https://github.com/microsoft/playwright/issues/20277

  // it.only("does switch the track when the `forward` media key is pressed", async () => {
  //   const tracksPage = await createTracksPage(electron)

  //   await tracksPage.logPressedKeys()

  //   await tracksPage.playTrack("01")

  //   const oldTrack = await tracksPage.playbar.getCurrentTrack()

  //   const desiredTrack = await tracksPage.queuebar.getNextTrack()

  //   if (!oldTrack) throw new Error("No current track is set")

  //   await tracksPage.pressMediaKey("MediaTrackNext")

  //   const newTrack = await tracksPage.playbar.getCurrentTrack()
  //   await tracksPage.pauseExecution()

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
})
