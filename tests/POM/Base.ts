import type { Page, Locator, ConsoleMessage } from "playwright"
import { TEST_IDS as id } from "../../packages/renderer/src/Consts"
import { isImage } from "./Helper"

export default function createBasePage(page: Page) {
  const playbarPlayButton = page.locator(id.asQuery.playbarPlayButton)
  const playbarNextButton = page.locator(id.asQuery.playbarNextButton)
  const playbarBackButton = page.locator(id.asQuery.playbarBackButton)
  const playbarQueueIcon = page.locator(id.asQuery.playbarQueueIcon)
  const nextTracks = page.locator(id.asQuery.queueBarNextTracks)
  const previousTracks = page.locator(id.asQuery.queuePlayedTracks)
  const progressbar = page.locator(id.asQuery.seekbarProgressbar)
  const playbarCover = page.locator(id.asQuery.playbarCover)
  const nextQueueTrack = page.locator(id.asQuery.queueNextTrack)
  const queueBar = page.locator(id.asQuery.queueBar)
  const currentTime = page.locator(id.asQuery.seekbarCurrentTime)
  const totalDuration = page.locator(id.asQuery.seekbarProgressbar)

  return {
    createErrorListener,
    clickSeekbar,
    reload,
    clickPlay,
    goToNextTrack,
    playPrevious,
    openQueue,
    getNextTracks,
    getPreviousTracks,
    getProgressBarWidth,
    getCoverPath,
    isRenderingPlaybarCover,
    playNextTrackFromQueue,
    getCurrentTime,
    getTotalDuration,
    hoverSeekbar,
    waitForProgressBarToGrow,
  }

  async function reload() {
    page.evaluate(() => window.location.reload())
  }

  async function waitForProgressBarToGrow(
    startWidth: number,
    endWith: number | undefined = undefined
  ) {
    if (endWith) {
      await page.waitForFunction(() => {
        return (
          document
            .querySelector(id.asQuery.seekbarProgressbar)
            ?.getBoundingClientRect().width || 0 >= endWith
        )
      }),
        endWith
    } else {
      await page.waitForFunction(() => {
        return (
          document
            .querySelector(id.asQuery.seekbarProgressbar)
            ?.getBoundingClientRect().width || 0 > 0
        )
      })
    }
  }

  async function getCoverPath() {
    return playbarCover.evaluate((element) => element.getAttribute("src"))
  }

  async function isRenderingPlaybarCover() {
    return playbarCover.evaluate((element) => {
      if (!isImage(element)) return false

      return !!element.naturalWidth
    })
  }

  async function createErrorListener() {
    const errors: Error[] = []

    const listener = (exception: Error) => {
      errors.push(exception)
      console.log(`Uncaught exception: "${exception}"`)
    }
    page.on("pageerror", listener)

    return {
      getErrors: () => errors,
      stopListeners: () => page.removeListener("pageerror", listener),
    }
  }

  async function clickPlay() {
    return playbarPlayButton.click({ timeout: 2000 })
  }

  async function goToNextTrack() {
    return playbarNextButton.click({ timeout: 2000 })
  }

  async function playPrevious() {
    return playbarBackButton.click({ timeout: 2000 })
  }

  async function playNextTrackFromQueue() {
    await nextQueueTrack.dblclick({ timeout: 2000 })
  }
  async function openQueue() {
    await playbarQueueIcon.click({ timeout: 1500 })
    await queueBar.isVisible()
  }

  async function getNextTracks() {
    return nextTracks
  }

  async function getPreviousTracks() {
    return previousTracks
  }

  async function getProgressBarWidth() {
    return (await progressbar.boundingBox({ timeout: 3000 }))?.width
  }

  async function clickSeekbar(percentage: number) {
    const x =
      ((await progressbar.boundingBox({ timeout: 2000 }))?.width ?? 0) *
      (percentage / 100)
    const y = ((await progressbar.boundingBox({ timeout: 2000 }))?.y ?? 0) / 2

    progressbar.click({
      position: {
        x,
        y,
      },
    })
  }

  async function getCurrentTime(): Promise<number> {
    await progressbar.hover()
    const time = convertDisplayTimeToSeconds(await currentTime.innerText())

    return time
  }

  async function getTotalDuration() {
    await progressbar.hover({ timeout: 2000 })
    const time = convertDisplayTimeToSeconds(await totalDuration.innerText())

    return time
  }

  async function hoverSeekbar() {
    await progressbar.hover({ timeout: 2000 })
  }
}

function convertDisplayTimeToSeconds(displayTime: string) {
  const [minutes, seconds] = displayTime.split(":").map((x) => Number(x))

  return minutes * 60 + seconds
}
