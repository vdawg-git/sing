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

it("changes the volume", async () => {
  const page = await electronApp.firstWindow()
  const tracksPage = createTracksPage(page)
  await tracksPage.reload()

  const oldVolume = await tracksPage.getVolume()
  if (oldVolume === undefined) throw new Error("Could not get volume")

  if (oldVolume <= 90) {
    await tracksPage.setVolume(100)
    const newVolume = await tracksPage.getVolume()

    expect(newVolume).toBeGreaterThan(oldVolume)
  } else {
    await tracksPage.setVolume(0)
    const newVolume = await tracksPage.getVolume()

    expect(newVolume).toBeLessThan(oldVolume)
  }
})
