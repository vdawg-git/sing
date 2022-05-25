import type { Page, Locator } from "playwright"
import { TEST_IDS as id } from "../../packages/renderer/src/Consts"
import { isImage } from "./Helper"

export default function createParentPage(page: Page) {
  const playbarPlayButton = page.locator(id.asQuery.playbarPlayButton)
  const playbarNextButton = page.locator(id.asQuery.playbarNextButton)
  const playbarBackButton = page.locator(id.asQuery.playbarBackButton)
  const playbarQueueIcon = page.locator(id.asQuery.playbarQueueIcon)
  const nextTracks = page.locator(id.asQuery.queueBarNextTracks)
  const previousTracks = page.locator(id.asQuery.queuePlayedTracks)
  const seekbar = page.locator(id.asQuery.seekbarProgressbar)
  const playbarCover = page.locator(id.asQuery.playbarCover)

  return {
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

  async function clickPlay() {
    return playbarPlayButton.click()
  }

  async function playNext() {
    return playbarNextButton.click()
  }

  async function playPrevious() {
    return playbarBackButton.click()
  }

  async function openQueue() {
    return playbarQueueIcon.click()
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
}
