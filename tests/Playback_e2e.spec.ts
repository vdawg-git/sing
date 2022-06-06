import type { ElectronApplication } from "playwright"
import { _electron as electron } from "playwright"
import { afterAll, beforeAll, describe, expect, it, test } from "vitest"
import createTracksPage from "./POM/TracksPage"
import { join } from "path"
import { launchElectron } from "./Helper"

let electronApp: ElectronApplication

beforeAll(async () => {
  electronApp = await launchElectron()
})

afterAll(async () => {
  await electronApp.close()
})

it("displays a cover", async () => {
  const page = await electronApp.firstWindow()
  const tracksPage = createTracksPage(page)
  tracksPage.reload()

  await tracksPage.clickPlay()
})

it("does not throw an error when playing a queue item", async () => {
  //todo setup

  const page = await electronApp.firstWindow()
  const tracksPage = createTracksPage(page)
  await tracksPage.reload()
  await tracksPage.openQueue()

  const errorListener = await tracksPage.createErrorListener()
  await tracksPage.playNextTrackFromQueue()
  setTimeout(() => {}, 5)

  errorListener.stopListeners()
  expect(errorListener.getErrors()).lengthOf(
    0,
    `Received error when playing a queue item.
  ${errorListener.getErrors().toString()}`
  )
})

it("progresses the seekbar when playing first song", async () => {
  const page = await electronApp.firstWindow()
  const tracksPage = createTracksPage(page)
  await tracksPage.reload()

  const oldWidth = await tracksPage.getProgressBarWidth()

  await tracksPage.clickPlay()

  if (oldWidth !== 0)
    throw new Error(
      "Beginning width of progressesBar is not 0, but " + oldWidth
    )
  await tracksPage.waitForProgressBarToGrow(oldWidth)

  const newWidth = await tracksPage.getProgressBarWidth()

  if (oldWidth === undefined) throw new Error("oldWidth is undefined") // for typescript
  if (newWidth === undefined) throw new Error("newWidth is undefined")

  expect(newWidth).toBeGreaterThan(oldWidth)
})

it("progresses the seekbar when playing second song", async () => {
  const page = await electronApp.firstWindow()
  const tracksPage = createTracksPage(page)
  await tracksPage.reload()

  const oldWidth = await tracksPage.getProgressBarWidth()

  await tracksPage.goToNextTrack()
  await tracksPage.clickPlay()

  if (oldWidth !== 0)
    throw new Error(
      "Beginning width of progressesBar is not 0, but " + oldWidth
    )
  await tracksPage.waitForProgressBarToGrow(oldWidth)

  const newWidth = await tracksPage.getProgressBarWidth()

  if (oldWidth === undefined) throw new Error("oldWidth is undefined") // for typescript
  if (newWidth === undefined) throw new Error("newWidth is undefined")

  expect(newWidth).toBeGreaterThan(oldWidth)
})

it("changes the current time when when clicking on the seekbar", async () => {
  const page = await electronApp.firstWindow()
  const tracksPage = createTracksPage(page)
  await tracksPage.reload()

  const oldTime = await tracksPage.getCurrentTime()

  await tracksPage.clickSeekbar(50)

  const newTime = await tracksPage.getCurrentTime()

  expect(newTime).toBeGreaterThan(oldTime)
})

it("displays the current time when hovering the seekbar", async () => {
  const page = await electronApp.firstWindow()
  const tracksPage = createTracksPage(page)
  await tracksPage.reload()

  await tracksPage.hoverSeekbar()

  expect(await tracksPage.getCurrentTime()).toBe(0)
})

it("displays the total time when hovering the seekbar", async () => {
  const page = await electronApp.firstWindow()
  const tracksPage = createTracksPage(page)
  await tracksPage.reload()

  await tracksPage.hoverSeekbar()

  expect(await tracksPage.getTotalDuration()).toBeGreaterThan(0)
})

it("goes to the next track in queue after the current has finished", async () => {
  const page = await electronApp.firstWindow()
  const tracksPage = createTracksPage(page)
  await tracksPage.reload()
  await tracksPage.openQueue()

  const oldNextTrack = await tracksPage.getNextTrack()

  await tracksPage.clickSeekbar(99)
  await tracksPage.clickPlay()
  await tracksPage.waitForTrackToChangeTo("Next track")

  const newCurrentTrack = await tracksPage.getCurrentTrack()

  expect(oldNextTrack).toBe(newCurrentTrack)
})

it("changes the volume when clicking the slider", async () => {
  const page = await electronApp.firstWindow()
  const tracksPage = createTracksPage(page)
  await tracksPage.reload()

  const oldVolume = await tracksPage.getVolume()

  await tracksPage.setVolume(0.5)
  const newVolume = await tracksPage.getVolume()

  expect(newVolume).not.toBe(oldVolume)
  expect(newVolume).toBeCloseTo(0.5, 1)
}, 50000)

it("visualizes the volume correctly", async () => {
  const page = await electronApp.firstWindow()
  const tracksPage = createTracksPage(page)

  const internalVolume = await tracksPage.getVolumeState()
  const sliderHeight = await tracksPage.getVolume()

  expect(internalVolume).toBeCloseTo(sliderHeight, 1)
})

it("does not play music when paused and going to the previous track", async () => {
  const page = await electronApp.firstWindow()
  const tracksPage = createTracksPage(page)
  await tracksPage.reload()

  await tracksPage.goToNextTrack()
  await tracksPage.goToPreviousTrack()

  const isPlaying = await tracksPage.isPlaying()

  expect(isPlaying).toBe(false)
})

it("does not play music when paused and going to the next track", async () => {
  const page = await electronApp.firstWindow()
  const tracksPage = createTracksPage(page)
  await tracksPage.reload()

  await tracksPage.goToNextTrack()

  const isPlaying = await tracksPage.isPlaying()

  expect(isPlaying).toBe(false)
})

it("does not play music when just opened", async () => {
  const page = await electronApp.firstWindow()
  const tracksPage = createTracksPage(page)
  await tracksPage.reload()

  const isPlaying = await tracksPage.isPlaying()

  expect(isPlaying).toBe(false)
})

it("is possible to seek to the end of the current track", async () => {
  throw new Error("To fix, make the seekbar an input range")
})
it("is possible to seek to the beginning of the current track", async () => {
  throw new Error("To fix, make the seekbar an input range")
})
