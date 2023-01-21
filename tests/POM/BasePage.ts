/* eslint-disable unicorn/prefer-dom-node-text-content */
import slash from "slash"

import {
  TEST_ATTRIBUTES,
  TEST_IDS,
} from "../../packages/renderer/src/TestConsts"
import { ROUTES } from "../../packages/renderer/src/Routes"

import { isE2ETrackTitle } from "./Helper"
import { createLibrarySettingsPage } from "./LibrarySettingsPage"
import { createTracksPage } from "./TracksPage"
import { createPlaybarOrganism } from "./Organisms/Playbar"
import { createQueuebarOrganism } from "./Organisms/Queuebar"

import type { ElectronApplication } from "playwright"

export async function createBasePage(electronApp: ElectronApplication) {
  const page = await electronApp.firstWindow()

  const playbar = await createPlaybarOrganism(page)
  const queuebar = await createQueuebarOrganism(page)

  const sidebar = page.locator(TEST_IDS.asQuery.sidebar)
  const sidebarItemTracks = sidebar.locator("text=Tracks")
  const sidebarMenu = page.locator(TEST_IDS.asQuery.sidebarMenu)
  const sidebarMenuIcon = page.locator(TEST_IDS.asQuery.sidebarMenuIcon)
  const sidebarMenuSettings = sidebarMenu.locator("text=Settings")
  const testAudioElement = page.locator(TEST_IDS.asQuery.testAudioELement)

  // const previousTracks = page.locator(TEST_IDS.asQuery.queuePlayedTracks)

  return {
    closeAllNotifications,
    createErrorListener,
    getMediaSessionMetaData: getMediaSessionData,
    isPlayingAudio,
    listenToPause,
    mockDialog,
    pauseExecution: () => page.pause(),
    pressMediaKey,
    reload,
    resetMusic,
    startVisualisingClicks,
    stopVisualisingClicks,
    waitForCurrentTrackToChangeTo,
    waitForNotification,

    playbar,
    queuebar,

    /**
     * Hard reload the page while setting it.
     */
    resetTo: {
      settingsLibrary: resetToLibrarySettings,
      tracks: resetToTracks,
    },
    /**
     * Navigate to a page like a user would do. Uses the sidebar.
     */
    goTo: {
      settingsLibrary: gotoSettings,
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

  async function resetToTracks() {
    await resetTo(ROUTES.tracks)

    return createTracksPage(electronApp)
  }

  async function resetToLibrarySettings() {
    await resetTo(ROUTES.settingsLibrary)

    return createLibrarySettingsPage(electronApp)
  }

  async function resetTo(location: string, id?: number | undefined) {
    const { pathname, protocol } = new URL(page.url())

    const path = `${protocol}//${pathname}#${location}${id ? `/${id}` : ""}`

    return page.goto(path, { timeout: 2000 })
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

  /**
   * Checks if the audio element on the page is playing.
   */
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

  async function createErrorListener() {
    const errors: Error[] = []

    function listener(exception: Error) {
      errors.push(exception)
      console.log(`Uncaught exception: "${exception}"`)
    }
    page.on("pageerror", listener)

    return {
      getErrors: () => errors,
      stopListeners: () => page.removeListener("pageerror", listener),
    }
  }

  /**
   * Get the title of the next or previous track and wait for the current track (from the playbar) to change to it.
   *
   * Throws an error if the specified track does not exists.
   */
  async function waitForCurrentTrackToChangeTo(
    waitFor: "Next track" | "Previous track"
  ): Promise<void>
  /**
   * Wait for the current track from the playbar to change to the specified title.
   * Use e2e titles like `01`, `02` or `10`.
   */
  async function waitForCurrentTrackToChangeTo(waitFor: string): Promise<void> {
    if (waitFor === "Next track" || waitFor === "Previous track") {
      const nextTitle =
        waitFor === "Next track"
          ? await queuebar.getNextTrack()
          : await queuebar.getPreviousTrack()
      if (!nextTitle) throw new Error(`Could not find ${waitFor} element`)

      return waitCurrentTrackToBecome(nextTitle)
    }

    if (!isE2ETrackTitle)
      throw new TypeError(
        `Invalid track title provided: ${waitFor} \nOnly e2e titles like "01" and "24" are allowed.`
      )

    return waitCurrentTrackToBecome(waitFor)
  }

  async function waitCurrentTrackToBecome(title: string) {
    const selector = TEST_IDS.asQuery.playbarTitle

    await page.waitForFunction(
      // eslint-disable-next-line @typescript-eslint/no-shadow
      ({ title, selector }) => {
        const currentTitle = document
          .querySelector(selector)
          ?.textContent?.slice(0, 2) // Get the track title

        return currentTitle === title
      },
      { title, selector }
    )
  }

  /**
   * Visualizses clicks by adding dots to where they occured.
   *
   * Mousedown is cyan, mouseup (normal click event) is red
   */
  async function startVisualisingClicks() {
    return page.evaluate(() => {
      // @ts-expect-error
      window._visualizeClick_ = ({ clientX: x, clientY: y }: MouseEvent) => {
        document.body.append(createClickDot({ x, y, opacity: 0.7 }))
      }

      // @ts-expect-error
      window._visualizeClickDown_ = ({
        clientX: x,
        clientY: y,
      }: MouseEvent) => {
        document.body.append(
          createClickDot({ x, y, color: "cyan", size: 6, opacity: 1 })
        )
      }

      // @ts-expect-error
      document.addEventListener("click", window._visualizeClick_)
      // @ts-expect-error
      document.addEventListener("mousedown", window._visualizeClickDown_)

      // eslint-disable-next-line unicorn/consistent-function-scoping
      function createClickDot(data: {
        x: number
        y: number
        color?: string
        size?: number
        opacity?: number
      }) {
        const element = document.createElement("div")
        element.style.position = "fixed"
        element.style.left = `${data.x}px`
        element.style.top = `${data.y}px`
        element.style.backgroundColor = data.color ?? "red"
        element.style.borderRadius = "50%"
        element.style.width = `${data.size ?? 9}px`
        element.style.height = `${data.size ?? 9}px`
        element.style.zIndex = "9999999"
        element.style.opacity = `${data.opacity ?? 1}`
        element.style.pointerEvents = "none"

        return element
      }
    })
  }

  async function stopVisualisingClicks() {
    return page.evaluate(() => {
      // @ts-expect-error
      document.removeEventListener("click", window._visualizeClick_)
      // @ts-expect-error
      document.removeEventListener("click", window._visualizeClickDown_)
    })
  }

  /**
   * Mock the electron file/folder selector dialog.
   * @param paths The paths it should return.
   */
  async function mockDialog(paths: string[]): Promise<void> {
    const returnValue = paths.map((path) => slash(path))

    // eslint-disable-next-line no-shadow, @typescript-eslint/no-shadow
    await electronApp.evaluate(async ({ dialog }, returnValue) => {
      // eslint-disable-next-line no-param-reassign
      dialog.showOpenDialog = () =>
        Promise.resolve({ canceled: false, filePaths: returnValue })
    }, returnValue)
  }

  /**
   * Closes all open notifications (which can be closed by the user).
   *
   * Useful when notifcations overlap a button and the test suite fails to click it because of that.
   */
  async function closeAllNotifications() {
    const closeButtons = await page.$$(
      TEST_ATTRIBUTES.asQuery.notificationCloseButton
    )

    for (const button of closeButtons) {
      await button.click({ timeout: 1200, force: true })
    }
  }

  /**
   * Listens to the audio player element for its `pause` event.
   * Not directly related to the UI, but nessecary to check if everything works.
   * @returns A function which returns if the audio was paused since invoking the `listenToPause` function
   */
  async function listenToPause(): Promise<() => Promise<boolean>> {
    await testAudioElement.evaluate((audioNode) => {
      // @ts-expect-error
      window._registerPause_ = () => {
        // @ts-expect-error
        window._hasPaused_ = true
      }

      // @ts-expect-error
      audioNode.addEventListener("pause", _registerPause_)
    })

    return () =>
      testAudioElement.evaluate((audioNode) => {
        // @ts-expect-error
        audioNode.removeEventListener("pause", _registerPause_)

        // @ts-expect-error
        return window._hasPaused_ ?? false
      })
  }

  async function getMediaSessionData() {
    const metadata = await page.evaluate(() => {
      console.log(navigator.mediaSession.metadata)

      return (
        (navigator.mediaSession.metadata &&
          // The MediaMetadata instance cannot get serialied as it seems.
          ({
            title: navigator.mediaSession.metadata.title.slice(0, 2), // Convert to e2e title
            artist: navigator.mediaSession.metadata.artist,
            album: navigator.mediaSession.metadata.album,
            artwork: navigator.mediaSession.metadata.artwork,
          } satisfies MediaMetadata)) ??
        undefined
      )
    })
    const playbackState = await page.evaluate(
      () => navigator.mediaSession.playbackState
    )

    return {
      metadata,
      playbackState,
    }
  }

  async function pressMediaKey(
    key:
      | "MediaTrackNext"
      | "MediaTrackPrevious"
      | "MediaPlayPause"
      | "MediaStop"
  ) {
    return page.keyboard.press(key)
  }
}

// playbackstate: navigator.mediaSession.metadata,
