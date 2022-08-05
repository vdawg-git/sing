import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest"

import { launchElectron } from "./Helper"
import createBasePage from "./POM/BasePage"
import createTracksPage from "./POM/TracksPage"

import type { ElectronApplication } from "playwright"

let electron: ElectronApplication

beforeAll(async () => {
  electron = await launchElectron()

  const basePage = await createBasePage(electron)

  const libraryPage = await basePage.resetTo("settings/library")
  await libraryPage.resetToDefault()

  await libraryPage.resetTo("tracks")
})

afterAll(async () => {
  await electron.close()
})

it("displays a cover", async () => {
  const tracksPage = await createTracksPage(electron)
  await tracksPage.reload() // Nessecary as the music got reset and the playbar has not current track
  // TODO implement saving queue and play state and restoring it when reopening the app

  expect(await tracksPage.isRenderingPlaybarCover()).toBe(true)
})

it("does not throw an error when playing a queue item", async () => {
  const tracksPage = await createTracksPage(electron)
  await tracksPage.reload()
  await tracksPage.openQueue()

  const errorListener = await tracksPage.createErrorListener()
  await tracksPage.playNextTrackFromQueue()

  errorListener.stopListeners()
  expect(errorListener.getErrors()).lengthOf(
    0,
    `Received error when playing a queue item.
  ${errorListener.getErrors().toString()}`
  )
})

it("progresses the seekbar when playing first song", async () => {
  const tracksPage = await createTracksPage(electron)
  await tracksPage.reload()

  const oldWidth = await tracksPage.getProgressBarWidth()

  await tracksPage.clickPlay()

  if (oldWidth !== 0)
    throw new Error(
      `Beginning width of progressesBar is not 0, but ${oldWidth}`
    )
  await tracksPage.waitForProgressBarToGrow(oldWidth)

  const newWidth = await tracksPage.getProgressBarWidth()

  if (oldWidth === undefined) throw new Error("oldWidth is undefined") // for typescript
  if (newWidth === undefined) throw new Error("newWidth is undefined")

  expect(newWidth).toBeGreaterThan(oldWidth)
})

it("progresses the seekbar when playing second song", async () => {
  const tracksPage = await createTracksPage(electron)
  await tracksPage.reload()

  const oldWidth = await tracksPage.getProgressBarWidth()

  await tracksPage.goToNextTrack()
  await tracksPage.clickPlay()

  if (oldWidth !== 0)
    throw new Error(
      `Beginning width of progressesBar is not 0, but ${oldWidth}`
    )
  await tracksPage.waitForProgressBarToGrow(oldWidth)

  const newWidth = await tracksPage.getProgressBarWidth()

  if (oldWidth === undefined) throw new Error("oldWidth is undefined") // for typescript
  if (newWidth === undefined) throw new Error("newWidth is undefined")

  expect(newWidth).toBeGreaterThan(oldWidth)
})

it("changes the current time when when clicking on the seekbar", async () => {
  const tracksPage = await createTracksPage(electron)
  await tracksPage.reload()

  const oldTime = await tracksPage.getCurrentTime()

  await tracksPage.clickSeekbar(50)

  const newTime = await tracksPage.getCurrentTime()

  expect(newTime).toBeGreaterThan(oldTime)
})

it("displays the current time when hovering the seekbar", async () => {
  const tracksPage = await createTracksPage(electron)
  await tracksPage.reload()

  await tracksPage.hoverSeekbar()

  expect(await tracksPage.getCurrentTime()).toBe(0)
})

it("displays the total time when hovering the seekbar", async () => {
  const tracksPage = await createTracksPage(electron)
  await tracksPage.reload()

  await tracksPage.hoverSeekbar()

  expect(await tracksPage.getTotalDuration()).toBeGreaterThan(0)
})

it("goes to the next track in queue after the current has finished", async () => {
  const tracksPage = await createTracksPage(electron)
  await tracksPage.openQueue()

  const oldNextTrack = await tracksPage.getNextTrack()

  await tracksPage.clickSeekbar(98)
  await tracksPage.clickPlay()
  await tracksPage.waitForTrackToChangeTo("Next track")

  const newCurrentTrack = await tracksPage.getCurrentTrack()

  expect(oldNextTrack).toBe(newCurrentTrack)
})

it("changes the volume when clicking the slider", async () => {
  const tracksPage = await createTracksPage(electron)

  const oldVolume = await tracksPage.getVolume()

  await tracksPage.setVolume(0.5)
  const newVolume = await tracksPage.getVolume()

  expect(newVolume).not.toBe(oldVolume)
  expect(newVolume).toBeCloseTo(0.5, 1)
}, 50_000)

it("visualizes the volume correctly", async () => {
  const tracksPage = await createTracksPage(electron)

  const internalVolume = await tracksPage.getVolumeState()
  const sliderHeight = await tracksPage.getVolume()

  expect(internalVolume).toBeCloseTo(sliderHeight, 1)
})

it("does not play music when paused and going to the previous track", async () => {
  const tracksPage = await createTracksPage(electron)
  await tracksPage.reload()

  await tracksPage.goToNextTrack()
  await tracksPage.goToPreviousTrack()

  const isPlaying = await tracksPage.isPlayingAudio()

  expect(isPlaying).toBe(false)
})

it("does not play music when paused and going to the next track", async () => {
  const tracksPage = await createTracksPage(electron)
  await tracksPage.reload()

  await tracksPage.goToNextTrack()

  const isPlaying = await tracksPage.isPlayingAudio()

  expect(isPlaying).toBe(false)
})

it("does not play music when just opened", async () => {
  const tracksPage = await createTracksPage(electron)
  await tracksPage.reload()

  const isPlaying = await tracksPage.isPlayingAudio()

  expect(isPlaying).toBe(false)
})

describe("when playing a track after adding folders from a blank state", async () => {
  beforeEach(async () => {
    const tracksPage = await createTracksPage(electron)
    await tracksPage.resetMusic()
  })

  it("does play the track correctly", async () => {
    const trackToPlay = "10_"

    const tracksPage = await createTracksPage(electron)
    const libraryPage = await tracksPage.goTo.settings()
    await libraryPage.addFolder(1)
    await libraryPage.saveAndSyncFolders()
    await libraryPage.goTo.tracks()

    await tracksPage.playTrack(trackToPlay)

    const currentTrack = await tracksPage.getCurrentTrack()

    expect(currentTrack).to.include(trackToPlay)
  })
})
