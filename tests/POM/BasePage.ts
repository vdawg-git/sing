import slash from "slash"

import { TEST_ATTRIBUTES, TEST_IDS } from "../../packages/renderer/src/TestConsts"
import { convertDisplayTimeToSeconds } from "../Helper"
import { reduceTitlesToFolders } from "./Helper"
import createLibrarySettingsPage from "./LibrarySettingsPage"
import createTracksPage from "./TracksPage"

/* eslint-disable unicorn/prefer-dom-node-text-content */
import type { IRoutes } from "../../packages/renderer/src/Consts"
import type { ElectronApplication } from "playwright"

export default async function createBasePage(electronApp: ElectronApplication) {
  const page = await electronApp.firstWindow()

  const currentTime = page.locator(TEST_IDS.asQuery.seekbarCurrentTime)
  const currentTrack = page.locator(TEST_IDS.asQuery.playbarTitle)
  const nextQueueTrack = page.locator(TEST_IDS.asQuery.queueNextTrack)
  const nextTrack = page.locator(TEST_IDS.asQuery.queueNextTrack)
  const nextTracks = page.locator(TEST_IDS.asQuery.queueBarNextTracks)
  const playBarVolumeIcon = page.locator(TEST_IDS.asQuery.playbarVolumeIcon)
  const playbarBackButton = page.locator(TEST_IDS.asQuery.playbarBackButton)
  const playbarCover = page.locator(TEST_IDS.asQuery.playbarCover)
  const playbarNextButton = page.locator(TEST_IDS.asQuery.playbarNextButton)
  const playbarPlayButton = page.locator(TEST_IDS.asQuery.playbarPlayButton)
  const playbarQueueIcon = page.locator(TEST_IDS.asQuery.playbarQueueIcon)
  const previousTrack = page.locator(TEST_IDS.asQuery.queuePreviousTrack)
  const previousTracks = page.locator(TEST_IDS.asQuery.queuePlayedTracks)
  const progressBarKnob = page.locator(TEST_IDS.asQuery.seekbarProgressbarKnob)
  const progressbar = page.locator(TEST_IDS.asQuery.seekbarProgressbar)
  const queueBar = page.locator(TEST_IDS.asQuery.queueBar)
  const seekbar = page.locator(TEST_IDS.asQuery.seekbar)
  const sidebar = page.locator(TEST_IDS.asQuery.sidebar)
  const sidebarItemTracks = sidebar.locator("text=Tracks")
  const sidebarMenu = page.locator(TEST_IDS.asQuery.sidebarMenu)
  const sidebarMenuIcon = page.locator(TEST_IDS.asQuery.sidebarMenuIcon)
  const sidebarMenuSettings = sidebarMenu.locator("text=Settings")
  const testAudioElement = page.locator(TEST_IDS.asQuery.testAudioELement)
  const totalDuration = page.locator(TEST_IDS.asQuery.seekbarTotalDuration)
  const volumeSlider = page.locator(TEST_IDS.asQuery.volumeSlider)
  const volumeSliderInner = page.locator(TEST_IDS.asQuery.volumeSliderInner)

  return {
    clickPlay,
    clickSeekbar,
    closeQueue,
    createErrorListener,
    dragKnob: dragSeekbarKnob,
    getCoverPath,
    getCurrentTime,
    getCurrentTrack,
    getNextTrack,
    getNextTracks,
    getPreviousTrack,
    getPreviousTracks,
    getProgressBarWidth,
    getQueueAddedFolders,
    getQueueItems,
    getTotalDuration,
    getVolume,
    getVolumeState,
    goToNextTrack,
    goToPreviousTrack,
    hoverSeekbar,
    hoverVolumeIcon,
    isPlayingAudio,
    isRenderingPlaybarCover,
    mockDialog,
    openQueue,
    playNextTrackFromQueue,
    reload,
    resetMusic,
    resetTo,
    setVolume,
    waitForNotification,
    waitForProgressBarToGrow,
    waitForTrackToChangeTo,
    goTo: {
      settings: gotoSettings,
      tracks: gotoTracks,
    },
  }

  async function resetMusic() {
    await page.evaluate(async () => window.api.resetMusic())
    await reload()
  }

  async function gotoSettings(): Promise<
    ReturnType<typeof createLibrarySettingsPage>
  > {
    await openSidebarMenu()
    await sidebarMenuSettings.click({ timeout: 3000, force: true })

    return createLibrarySettingsPage(electronApp)
  }

  async function gotoTracks() {
    await sidebarItemTracks.click({ timeout: 2000, force: true })

    // await page.waitForTimeout(520) // Rendering of the store does not seem to be instant

    return createTracksPage(electronApp)
  }

  async function openSidebarMenu() {
    const isVisible = await sidebarMenu.isVisible()
    if (isVisible) return

    await sidebarMenuIcon.click({ timeout: 2000 })
    await sidebarMenu.waitFor({ state: "visible", timeout: 2000 })
  }

  async function resetTo(
    location: "settings/general" | "settings/library",
    id?: number
  ): Promise<ReturnType<typeof createLibrarySettingsPage>>
  async function resetTo(
    location: "tracks",
    id?: number
  ): Promise<ReturnType<typeof createTracksPage>>
  async function resetTo(
    location: IRoutes,
    id?: number
  ): Promise<
    ReturnType<typeof createTracksPage | typeof createLibrarySettingsPage>
  > {
    const { pathname, protocol } = new URL(page.url())

    const path = `${protocol}//${pathname}#${location}${id ? `/${id}` : ""}`

    await page.goto(path, { timeout: 2000 })

    switch (location) {
      case "settings/library":
      case "settings/general":
        return createLibrarySettingsPage(electronApp)

      case "tracks":
        return createTracksPage(electronApp)

      default:
        throw new Error("Invalid location // Not implemented")
    }
  }

  async function reload() {
    await page.reload()
  }

  async function waitForNotification(label: string, timeout = 4000) {
    return page.waitForSelector(
      `${TEST_ATTRIBUTES.asQuery.notification}:has-text('${label}')`,
      { timeout }
    )
  }

  async function isPlayingAudio(): Promise<boolean> {
    const isPlaying = await testAudioElement.evaluate(
      (element) =>
        !(
          (element as HTMLMediaElement).paused ||
          (element as HTMLMediaElement).ended
        )
    )

    return isPlaying
  }

  async function waitForProgressBarToGrow(desiredWidth: number) {
    const selector = TEST_IDS.asQuery.seekbarProgressbar

    await page.waitForFunction(
      // eslint-disable-next-line @typescript-eslint/no-shadow
      ({ selector, desiredWidth }) => {
        const progressBar = document.querySelector(selector)
        const width = progressBar?.getBoundingClientRect().width || 0

        if (width > desiredWidth) return true
        return false
      },
      { selector, desiredWidth }
    )
  }

  async function getCoverPath() {
    return playbarCover.evaluate((element: HTMLElement) =>
      element.getAttribute("src")
    )
  }

  async function isRenderingPlaybarCover() {
    return playbarCover.evaluate((element: HTMLElement) => {
      if (element?.tagName !== "IMG") return false

      return !!(element as HTMLImageElement)?.naturalWidth
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

  async function goToPreviousTrack() {
    return playbarBackButton.click({ timeout: 2000 })
  }

  async function playNextTrackFromQueue() {
    await nextQueueTrack.dblclick({ timeout: 2000 })
  }

  async function isQueueOpen() {
    if (await queueBar.isVisible()) return true

    return false
  }

  async function openQueue() {
    if (await isQueueOpen()) return

    await playbarQueueIcon.click({ timeout: 1500 })
    await queueBar.waitFor({ state: "visible", timeout: 5000 })
  }

  async function closeQueue() {
    if (!isQueueOpen()) return

    await playbarQueueIcon.click({ timeout: 1500 })
    await queueBar.waitFor({ state: "detached", timeout: 5000 })
  }

  async function getNextTracks() {
    return nextTracks
  }

  async function getPreviousTracks() {
    return previousTracks
  }

  async function getProgressBarWidth() {
    const boundingBox = await progressbar.boundingBox({ timeout: 3000 })

    return boundingBox?.width
  }

  async function getNextTrack(): Promise<string | undefined> {
    const element = await nextTrack.elementHandle({ timeout: 2000 })
    const titleElement = await element?.$(
      TEST_ATTRIBUTES.asQuery.queueItemTitle
    )
    return titleElement?.innerText()
  }
  async function getPreviousTrack(): Promise<string | undefined> {
    const element = await previousTrack.elementHandle({ timeout: 2000 })
    const titleElement = await element?.$(
      TEST_ATTRIBUTES.asQuery.queueItemTitle
    )
    return titleElement?.innerText()
  }
  async function getCurrentTrack(): Promise<string | undefined> {
    if ((await currentTrack.count()) === 0) return undefined

    return currentTrack.innerText({ timeout: 2000 })
  }

  async function waitForTrackToChangeTo(
    waitFor: "Next track" | "Previous track"
  ): Promise<void>
  async function waitForTrackToChangeTo(waitFor: string): Promise<void> {
    if (waitFor === "Next track" || waitFor === "Previous track") {
      const nextTitle =
        waitFor === "Next track"
          ? await getNextTrack()
          : await getPreviousTrack()
      if (!nextTitle) return undefined

      return waitPlaybarTitleToBecome(nextTitle)
    }
    return waitPlaybarTitleToBecome(waitFor)
  }

  async function waitPlaybarTitleToBecome(that: string) {
    const selector = TEST_IDS.asQuery.playbarTitle

    await page.waitForFunction(
      // eslint-disable-next-line @typescript-eslint/no-shadow
      ({ that, selector }) => {
        const currentTitle = document.querySelector(selector)?.textContent

        return currentTitle === that
      },
      { that, selector }
    )
  }

  async function clickSeekbar(percentage: number) {
    const boundingBox = await seekbar.boundingBox({ timeout: 1000 })

    const x = (boundingBox?.width ?? 0) * (percentage / 100)

    await seekbar.click({
      position: {
        x,
        y: 0,
      },
      timeout: 1000,
      force: true,
    })
  }

  async function dragSeekbarKnob(amount: number) {
    await progressBarKnob.dragTo(seekbar, {
      targetPosition: { x: amount, y: 0 },
    })
  }

  async function getCurrentTime(): Promise<number> {
    await hoverSeekbar()
    const time = convertDisplayTimeToSeconds(
      await currentTime.innerText({ timeout: 3000 })
    )

    return time
  }

  async function getTotalDuration() {
    await hoverSeekbar()
    const time = convertDisplayTimeToSeconds(await totalDuration.innerText())

    return time
  }

  async function hoverSeekbar() {
    await seekbar.hover({ timeout: 2000 })
  }

  async function hoverVolumeIcon() {
    await playBarVolumeIcon.hover({ timeout: 2500, force: true })
  }

  async function getVolumeState(): Promise<number> {
    const volume = await testAudioElement.evaluate(
      (element) => (element as HTMLMediaElement).volume
    )

    return volume
  }

  async function getVolume(): Promise<number> {
    await hoverVolumeIcon()
    const container = await volumeSlider.boundingBox()
    const slider = await volumeSliderInner.boundingBox()

    const heightTotal = container?.height
    const sliderHeight = slider?.height

    if (heightTotal === undefined || sliderHeight === undefined) return 0

    return sliderHeight / heightTotal
  }

  async function setVolume(volume: number): Promise<void> {
    await hoverVolumeIcon()

    const { height, width } = (await volumeSlider.boundingBox({
      timeout: 2000,
    })) || { height: undefined, width: undefined }

    if (height === undefined) {
      throw new Error("height of volume slider is undefined")
    }
    if (width === undefined) {
      throw new Error("width of volume slider is undefined")
    }

    const heightToReach = height * volume
    const x = width || 12 * 0.5 // Do not click on the border

    await volumeSlider.click({
      position: {
        y: heightToReach,
        x,
      },
      timeout: 2000,
    })

    await validateAndWaitForAnimation()

    async function validateAndWaitForAnimation(
      newHeight?: number | undefined,
      previousHeight?: number | undefined
    ): Promise<boolean> {
      const boundingBox = await volumeSliderInner.boundingBox()

      const newElementHeight = boundingBox?.height

      if (newElementHeight === undefined)
        throw new Error("height of volume gradient is undefined")

      if (newElementHeight !== previousHeight) {
        await page.waitForTimeout(10)
        return validateAndWaitForAnimation(newElementHeight, newHeight)
      }
      return newElementHeight === heightToReach
    }
  }

  async function mockDialog(paths: string[]): Promise<void> {
    const returnValue = paths.map((path) => slash(path))

    // eslint-disable-next-line no-shadow, @typescript-eslint/no-shadow
    await electronApp.evaluate(async ({ dialog }, returnValue) => {
      // eslint-disable-next-line no-param-reassign
      dialog.showOpenDialog = () =>
        Promise.resolve({ canceled: false, filePaths: returnValue })
    }, returnValue)
  }

  async function getQueueItems() {
    await openQueue()

    const queueItems = await page.$$(TEST_ATTRIBUTES.asQuery.queueItem)

    const items = await Promise.all(
      queueItems.map(async (item) => {
        const [titleElement, coverElement, artistElement] = [
          await item.$(TEST_ATTRIBUTES.asQuery.queueItemTitle),
          await item.$(TEST_ATTRIBUTES.asQuery.queueItemCover),
          await item.$(TEST_ATTRIBUTES.asQuery.queueItemArtist),
        ]
        const title = await titleElement?.innerText()
        const cover = await coverElement?.innerText()
        const artist = await artistElement?.innerText()

        return {
          title,
          cover,
          artist,
        }
      })
    )

    await closeQueue()

    return items
  }

  async function getQueueAddedFolders() {
    const items = await getQueueItems()

    const folders = reduceTitlesToFolders(items.map((item) => item.title))

    return folders
  }
}
