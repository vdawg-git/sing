import type { ElectronApplication } from "playwright"
import { _electron as electron } from "playwright"
import { afterAll, beforeAll, describe, expect, it, test } from "vitest"
import createTracksPage from "./POM/TracksPage"
import { join } from "path"

let electronApp: ElectronApplication

beforeAll(async () => {
  // electronApp = await electron.launch({
  //   args: ["."],
  // })
  const mainPath = join(
    __dirname,
    "..",
    "packages",
    "main",
    "dist",
    "index.cjs"
  )
  console.log(mainPath)

  electronApp = await electron.launch({
    args: [mainPath],
  })
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

it("progresses the seekbar", async () => {
  const page = await electronApp.firstWindow()
  const tracksPage = createTracksPage(page)
  await tracksPage.reload()

  const oldWidth = await tracksPage.getProgressBarWidth()

  await tracksPage.clickPlay()
  setTimeout(() => {}, 100)

  const newWidth = await tracksPage.getProgressBarWidth()

  if (oldWidth === undefined) throw new Error("oldWidth is undefined")
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

  expect(tracksPage.getCurrentTime()).toBe(0)
})

it("displays the total time when hovering the seekbar", async () => {
  const page = await electronApp.firstWindow()
  const tracksPage = createTracksPage(page)
  await tracksPage.reload()

  await tracksPage.hoverSeekbar()

  expect(tracksPage.getTotalDuration()).toBeGreaterThan(0)
})

it("does not display the total time when not hovering the seekbar", async () => {
  const page = await electronApp.firstWindow()
  const tracksPage = createTracksPage(page)
  await tracksPage.reload()

  expect(tracksPage.getTotalDuration()).toThrow()
})

it("does not display the total time when not hovering the seekbar", async () => {
  const page = await electronApp.firstWindow()
  const tracksPage = createTracksPage(page)
  await tracksPage.reload()

  expect(tracksPage.getCurrentTime()).toThrow()
})

it.todo(
  "goes to the next track in queue after the current has finished",
  async () => {}
)

test.todo("Main window web content", async () => {
  const page = await electronApp.firstWindow()
  const element = await page.$("#app", { strict: true })
})
