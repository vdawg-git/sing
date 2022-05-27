import type { Page, Locator, ConsoleMessage } from "playwright"
import { TEST_IDS as id } from "../../packages/renderer/src/Consts"
import { isImage } from "./Helper"

export default function createParentPage(page: Page) {
  const playbarPlayButton = page.locator(
    id.asQuery.noBrackets.playbarPlayButton
  )
  const playbarNextButton = page.locator(
    id.asQuery.noBrackets.playbarNextButton
  )
  const playbarBackButton = page.locator(
    id.asQuery.noBrackets.playbarBackButton
  )
  const playbarQueueIcon = page.locator(id.asQuery.noBrackets.playbarQueueIcon)
  const nextTracks = page.locator(id.asQuery.noBrackets.queueBarNextTracks)
  const previousTracks = page.locator(id.asQuery.noBrackets.queuePlayedTracks)
  const seekbar = page.locator(id.asQuery.noBrackets.seekbarProgressbar)
  const playbarCover = page.locator(id.asQuery.noBrackets.playbarCover)
  const nextQueueTrack = page.locator(id.asQuery.noBrackets.queueNextTrack)
  const queueBar = page.locator(id.asQuery.noBrackets.queueBar)
  const currentTime = page.locator(id.asQuery.noBrackets.seekbarCurrentTime)
  const totalDuration = page.locator(id.asQuery.noBrackets.seekbarDuration)

  return {
    createErrorListener,
    clickSeekbar,
    reload,
    clickPlay,
    playNext,
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
  }

  async function reload() {
    page.evaluate(() => window.location.reload())
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
    return playbarPlayButton.click()
  }

  async function playNext() {
    return playbarNextButton.click()
  }

  async function playPrevious() {
    return playbarBackButton.click()
  }

  async function playNextTrackFromQueue() {
    await nextQueueTrack.dblclick()
  }
  async function openQueue() {
    await playbarQueueIcon.click()
    await queueBar.isVisible()
  }

  async function getNextTracks() {
    return nextTracks
  }

  async function getPreviousTracks() {
    return previousTracks
  }

  async function getProgressBarWidth() {
    return (await seekbar.boundingBox())?.width
  }

  async function clickSeekbar(percentage: number) {
    const x = ((await seekbar.boundingBox())?.width ?? 0) * (percentage / 100)
    const y = ((await seekbar.boundingBox())?.y ?? 0) / 2

    seekbar.click({
      position: {
        x,
        y,
      },
    })
  }

  async function getCurrentTime(): Promise<number> {
    await seekbar.hover()
    const time = convertDisplayTimeToSeconds(await currentTime.innerText())

    return time
  }

  async function getTotalDuration() {
    await seekbar.hover()
    const time = convertDisplayTimeToSeconds(await totalDuration.innerText())

    return time
  }

  async function hoverSeekbar() {
    await seekbar.hover()
  }
}

function convertDisplayTimeToSeconds(displayTime: string) {
  const [minutes, seconds] = displayTime.split(":").map((x) => Number(x))

  return minutes * 60 + seconds
}
