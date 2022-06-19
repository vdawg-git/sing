import {
  testAttr,
  TEST_IDS as id,
} from "../../packages/renderer/src/TestConsts"

import { ElectronApplication } from "playwright"
import createBasePage from "./BasePage"

export default async function createTracksPage(electron: ElectronApplication) {
  const basePage = await createBasePage(electron)
  const page = await electron.firstWindow()

  const title = page.locator(id.asQuery.myTracksTitle)

  return {
    ...basePage,

    getAddedFolders,
    getTracks,
    isDisplayed,
    playTrack,
  }

  async function isDisplayed(): Promise<boolean> {
    return title.isVisible()
  }

  async function getTracks() {
    const tracks = await Promise.all(
      (
        await page.$$(testAttr.asQuery.trackItem)
      ).map(async (track) => {
        return {
          title: await (
            await track.$(testAttr.asQuery.trackItemTitle)
          )?.innerText(),
          artist: await (
            await track.$(testAttr.asQuery.trackItemArtist)
          )?.innerText(),
          album: await (
            await track.$(testAttr.asQuery.trackItemAlbum)
          )?.innerText(),
          duration: await (
            await track.$(testAttr.asQuery.trackItemDuration)
          )?.innerText(),
        }
      })
    )

    return tracks
  }

  async function getAddedFolders(): Promise<number[]> {
    const tracks = await getTracks()

    const folders = tracks
      .map((track) => track.title?.at(0))
      .reduce((acc, track) => {
        if (track === undefined) {
          console.error("Track title is undefined ")
          return acc
        }

        const folder = Number(track)

        if (acc.indexOf(folder) !== -1) {
          return acc
        }

        acc.push(folder)

        return acc
      }, [] as number[])

    return folders
  }

  async function playTrack(title: string): Promise<void> {
    const element = page.locator(testAttr.asQuery.trackItem, {
      hasText: title,
    })

    if ((await element.count()) === 0)
      throw new Error(`Track element with title: ${title} not found`)

    await element.click({ timeout: 2000 })
  }
}
