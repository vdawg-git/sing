import type { ElectronApplication } from "playwright"
import { _electron as electron } from "playwright"
import { afterAll, beforeAll, describe, expect, it, test } from "vitest"
import {
  TEST_IDS as id,
  TEST_GROUPS as group,
} from "../packages/renderer/src/Consts"
import "../packages/preload/contracts.d.ts"
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

it("progresses the seekbar", async () => {
  const page = await electronApp.firstWindow()
  const tracksPage = createTracksPage(page)
  tracksPage.reload()

  const oldWidth = await tracksPage.getProgressBarWidth()

  await tracksPage.clickPlay()
  setTimeout(() => {}, 100)

  const newWidth = await tracksPage.getProgressBarWidth()

  if (oldWidth === undefined) throw new Error("oldWidth is undefined")
  if (newWidth === undefined) throw new Error("newWidth is undefined")

  expect(newWidth).toBeGreaterThan(oldWidth)
})

it.todo(
  "goes to the next track in queue after the current has finished",
  async () => {}
)

test.todo("Main window web content", async () => {
  const page = await electronApp.firstWindow()
  const element = await page.$("#app", { strict: true })
})
