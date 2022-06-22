import type { ElectronApplication } from "playwright"
import {
  TEST_IDS as id,
  testAttr as testAttr,
} from "../../packages/renderer/src//TestConsts"
import { convertDisplayTimeToSeconds, isImageElement } from "../Helper"
import { type IRoutes } from "../../packages/renderer/src/Consts"
import createLibrarySettingsPage from "./LibrarySettingsPage"
import createTracksPage from "./TracksPage"
import { reduceTitlesToFolders } from "./Helper"
import slash from "slash"

export default async function createBasePage(electronApp: ElectronApplication) {
  const page = await electronApp.firstWindow()

  const currentTime = page.locator(id.asQuery.seekbarCurrentTime)
  const currentTrack = page.locator(id.asQuery.playbarTitle)
  const nextQueueTrack = page.locator(id.asQuery.queueNextTrack)
  const nextTrack = page.locator(id.asQuery.queueNextTrack)
  const nextTracks = page.locator(id.asQuery.queueBarNextTracks)
  const playBarVolumeIcon = page.locator(id.asQuery.playbarVolumeIcon)
  const playbarBackButton = page.locator(id.asQuery.playbarBackButton)
  const playbarCover = page.locator(id.asQuery.playbarCover)
  const playbarNextButton = page.locator(id.asQuery.playbarNextButton)
  const playbarPlayButton = page.locator(id.asQuery.playbarPlayButton)
  const playbarQueueIcon = page.locator(id.asQuery.playbarQueueIcon)
  const previousTrack = page.locator(id.asQuery.queuePreviousTrack)
  const previousTracks = page.locator(id.asQuery.queuePlayedTracks)
  const progressBarKnob = page.locator(id.asQuery.seekbarProgressbarKnob)
  const progressbar = page.locator(id.asQuery.seekbarProgressbar)
  const queueBar = page.locator(id.asQuery.queueBar)
  const seekbar = page.locator(id.asQuery.seekbar)
  const sidebar = page.locator(id.asQuery.sidebar)
  const sidebarItemTracks = sidebar.locator("text=Tracks")
  const sidebarMenu = page.locator(id.asQuery.sidebarMenu)
  const sidebarMenuIcon = page.locator(id.asQuery.sidebarMenuIcon)
  const sidebarMenuSettings = sidebarMenu.locator("text=Settings")
  const testAudioElement = page.locator(id.asQuery.testAudioELement)
  const totalDuration = page.locator(id.asQuery.seekbarTotalDuration)
  const volumeSlider = page.locator(id.asQuery.volumeSlider)
  const volumeSliderInner = page.locator(id.asQuery.volumeSliderInner)

  return {
    clickPlay,
    clickSeekbar,
    closeQueue,
    createErrorListener,
    dragKnob,
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
    waitForProgressBarToGrow,
    waitForTrackToChangeTo,
    goTo: {
      settings: gotoSettings,
      tracks: gotoTracks,
    },
  }

  async function resetMusic() {
    await page.evaluate(() => window.api.resetMusic())
    await page.reload()
  }

  async function gotoSettings(): Promise<
    ReturnType<typeof createLibrarySettingsPage>
  > {
    await openSidebarMenu()
    await sidebarMenuSettings.click({ timeout: 3000 })

    return await createLibrarySettingsPage(electronApp)
  }

  async function gotoTracks() {
    await sidebarItemTracks.click({ timeout: 2000 })

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

    const path =
      protocol + "//" + pathname + "#" + location + (id ? `/${id}` : "")

    await page.goto(path, { timeout: 2000 })

    switch (location) {
      case "settings/library":
      case "settings/general":
        return await createLibrarySettingsPage(electronApp)

      case "tracks":
        return await createTracksPage(electronApp)

      default:
        throw new Error("Invalid location // Not implemented")
    }
  }

  async function reload() {
    await page.reload()
  }

  async function isPlayingAudio(): Promise<boolean> {
    const isPlaying = await testAudioElement.evaluate((e) => {
      if (!isMediaElement(e))
        throw new Error("Element is not a media element, but " + e.nodeName)

      return !(e.paused || e.ended)

      function isMediaElement(
        e: HTMLElement | SVGElement
      ): e is HTMLMediaElement {
        if (e.nodeName === "AUDIO") return true
        if (e.nodeName === "VIDEO") return true

        return false
      }
    })

    return isPlaying
  }

  async function waitForProgressBarToGrow(desiredWidth: number) {
    const selector = id.asQuery.seekbarProgressbar

    await page.waitForFunction(
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
      if (!isImageElement(element)) return false

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

  async function goToPreviousTrack() {
    return playbarBackButton.click({ timeout: 2000 })
  }

  async function playNextTrackFromQueue() {
    await nextQueueTrack.dblclick({ timeout: 2000 })
  }
  async function openQueue() {
    if (await queueBar.isVisible()) return

    await playbarQueueIcon.click({ timeout: 1500 })
    await queueBar.waitFor({ state: "visible", timeout: 5000 })
  }

  async function closeQueue() {
    if (!(await queueBar.isVisible())) return

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
    return (await progressbar.boundingBox({ timeout: 3000 }))?.width
  }

  async function getNextTrack(): Promise<String | undefined> {
    const element = await nextTrack.elementHandle({ timeout: 2000 })
    const titleElement = await element?.$(testAttr.asQuery.queueItemTitle)
    return titleElement?.innerText()
  }
  async function getPreviousTrack(): Promise<String | undefined> {
    const element = await previousTrack.elementHandle({ timeout: 2000 })
    const titleElement = await element?.$(testAttr.asQuery.queueItemTitle)
    return titleElement?.innerText()
  }
  async function getCurrentTrack(): Promise<String | undefined> {
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

      return waitTitleToBecomeThat(nextTitle)
    } else {
      return waitTitleToBecomeThat(waitFor)
    }

    async function waitTitleToBecomeThat(that: String) {
      const selector = id.asQuery.playbarTitle

      await page.waitForFunction(
        ({ that, selector }) => {
          const currentTitle = document.querySelector(selector)?.textContent

          return currentTitle === that
        },
        { that, selector }
      )
    }
  }

  async function clickSeekbar(percentage: number) {
    const x =
      ((await seekbar.boundingBox({ timeout: 1000 }))?.width ?? 0) *
      (percentage / 100)

    await seekbar.click({
      position: {
        x,
        y: 0,
      },
      timeout: 1000,
      force: true,
    })
  }

  async function dragKnob(amount: number) {
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
    const volume = await testAudioElement.evaluate((e) => {
      const x = e as unknown as HTMLAudioElement

      return x.volume
    })

    return volume
  }

  async function getVolume(): Promise<number> {
    await hoverVolumeIcon()

    const heightTotal = (await volumeSlider.boundingBox())?.height
    const sliderHeight = (await volumeSliderInner.boundingBox())?.height

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
    const x = width || 12 * 0.5

    await volumeSlider.click({
      position: {
        y: heightToReach,
        x, // Do not click on the border
      },
      timeout: 2000,
    })

    await validateAndWaitForAnimation()

    async function validateAndWaitForAnimation(
      height: number | undefined = undefined,
      previousHeight: number | undefined = undefined
    ) {
      const newElementHeight = (await volumeSliderInner.boundingBox())?.height
      if (newElementHeight === undefined)
        throw new Error("height of volume gradient is undefined")

      if (newElementHeight !== previousHeight) {
        await page.waitForTimeout(10)
        await validateAndWaitForAnimation(newElementHeight, height)
      } else {
        return newElementHeight === heightToReach
      }
    }
  }

  async function mockDialog(paths: string[]): Promise<void> {
    const returnValue = paths.map((path) => slash(path))

    await electronApp.evaluate(async ({ dialog }, returnValue) => {
      dialog.showOpenDialog = () =>
        Promise.resolve({ canceled: false, filePaths: returnValue })
    }, returnValue)
  }

  async function getQueueItems() {
    await openQueue()

    const items = await Promise.all(
      (
        await page.$$(testAttr.asQuery.queueItem)
      ).map(async (item) => {
        return {
          title: await (
            await item.$(testAttr.asQuery.queueItemTitle)
          )?.innerText(),
          cover: await (
            await item.$(testAttr.asQuery.queueItemCover)
          )?.innerText(),
          artist: await (
            await item.$(testAttr.asQuery.queueItemArtist)
          )?.innerText(),
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
