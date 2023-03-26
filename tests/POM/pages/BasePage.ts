/* eslint-disable unicorn/prefer-dom-node-text-content */
import slash from "slash"

import { TEST_IDS } from "@sing-renderer/TestConsts"
import { ROUTES } from "@sing-renderer/Routes"

import type {
  PlaywrightTestArgs,
  PlaywrightTestOptions,
  PlaywrightWorkerArgs,
  PlaywrightWorkerOptions,
  TestType,
} from "@playwright/test"
import type { ElectronApplication } from "playwright"

import { createNotificationsOrganism } from "#organisms/Notifications"
import { isE2ETrackTitle } from "#/Helper"
import { createLibrarySettingsPage } from "#pages/LibrarySettingsPage"
import { createTracksPage } from "#pages/TracksPage"
import { createAlbumsPage } from "#pages/AlbumsPage"
import { createArtistsPage } from "#pages/ArtistsPage"
import { createPlaybarOrganism } from "#organisms/Playbar"
import { createQueuebarOrganism } from "#organisms/Queuebar"
import { createSearchbarOrganism } from "#organisms/Searchbar"
import { createMenuOrganism } from "#organisms/Menu"

export async function createBasePage(electron: ElectronApplication) {
  const page = await electron.firstWindow()

  const playbar = await createPlaybarOrganism(electron),
    queuebar = await createQueuebarOrganism(electron),
    searchbar = await createSearchbarOrganism(electron),
    menu = await createMenuOrganism(electron),
    notifications = await createNotificationsOrganism(electron)
  const sidebar = page.getByTestId(TEST_IDS.sidebar),
    sidebarItemAlbums = sidebar.locator("text=Albums"),
    sidebarItemArtists = sidebar.locator("text=Artists"),
    sidebarItemTracks = sidebar.locator("text=Tracks"),
    sidebarMenu = page.getByTestId(TEST_IDS.sidebarMenu),
    sidebarMenuIcon = page.getByTestId(TEST_IDS.sidebarMenuIcon),
    sidebarMenuSettings = sidebarMenu.locator("text=Settings"),
    testAudioElement = page.getByTestId(TEST_IDS.testAudioELement)

  return {
    createErrorListener,
    getMediaSessionMetaData: getMediaSessionData,
    isPlayingAudio,
    listenToPause,
    logPressedKeys,
    mockDialog,
    pauseExecution: () => page.pause(),
    pauseOnFailure,
    reload,
    startVisualisingClicks,
    stopLoggingPressedKeys,
    stopVisualisingClicks,
    waitForCurrentTrackToChangeTo,

    menu,
    notifications,
    playbar,
    queuebar,
    searchbar,

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
      albums: gotoAlbums,
      artists: goToArtists,
    },
  }

  async function gotoSettings(): Promise<
    ReturnType<typeof createLibrarySettingsPage>
  > {
    await openSidebarMenu()
    await sidebarMenuSettings.click({ force: true })

    const settingsLibraryPage = await createLibrarySettingsPage(electron)
    await settingsLibraryPage.folder.first().waitFor({ state: "visible" })

    return settingsLibraryPage
  }

  async function gotoTracks() {
    await sidebarItemTracks.click({ force: true })

    const tracksPage = await createTracksPage(electron)

    await tracksPage.waitToBeVisible()

    return tracksPage
  }

  async function gotoAlbums() {
    await sidebarItemAlbums.click({ force: true })

    const albumsPage = await createAlbumsPage(electron)
    await albumsPage.waitToBeVisible()

    return albumsPage
  }

  async function goToArtists() {
    await sidebarItemArtists.click({ force: true })

    const artistsPage = await createArtistsPage(electron)
    await artistsPage.waitToBeVisible()

    return artistsPage
  }

  async function openSidebarMenu() {
    const isVisible = await sidebarMenu.isVisible()
    if (isVisible) return

    await sidebarMenuIcon.click()
    await sidebarMenu.waitFor({ state: "visible" })
  }

  async function resetToTracks() {
    await resetTo(ROUTES.tracks)

    const tracksPage = await createTracksPage(electron)

    await tracksPage.waitToBeVisible()
    return tracksPage
  }

  async function resetToLibrarySettings() {
    await resetTo(ROUTES.settingsLibrary)

    const librarySettingsPage = await createLibrarySettingsPage(electron)
    await librarySettingsPage.waitToBeVisible()

    return librarySettingsPage
  }

  async function resetTo(location: string, id?: number | undefined) {
    const { pathname, protocol } = new URL(page.url())

    const path = `${protocol}//${pathname}#${location}${id ? `/${id}` : ""}`

    return page.goto(path)
  }

  async function reload() {
    await page.reload()
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
          ? await queuebar.getNextTrackTitle()
          : await queuebar.getPreviousTrackTitle()
      if (!nextTitle) throw new Error(`Could not find ${waitFor} element`)

      return waitCurrentTrackToBecome(nextTitle)
    }

    if (!isE2ETrackTitle(waitFor))
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
   * Mousedown clicks are `cyan`, mouseup (normal click event) are `red`.
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
    await electron.evaluate(async ({ dialog }, returnValue) => {
      // eslint-disable-next-line no-param-reassign
      dialog.showOpenDialog = () =>
        Promise.resolve({ canceled: false, filePaths: returnValue })
    }, returnValue)
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
    // Nessecary as the state needs to be updated
    await page.waitForTimeout(5)

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

  async function pauseOnFailure(
    test: TestType<
      PlaywrightTestArgs & PlaywrightTestOptions,
      PlaywrightWorkerArgs & PlaywrightWorkerOptions
    >
  ) {
    if (test.info().errors) {
      await page.pause()

      throw test.info().errors.at(0)
    }
  }

  // Media keys wont trigger anything as they will be emitted as untrusted events.
  // async function pressMediaKey(
  //   key:
  //     | "MediaTrackNext"
  //     | "MediaTrackPrevious"
  //     | "MediaPlayPause"
  //     | "MediaStop"
  // ) {
  //   // eslint-disable-next-line @typescript-eslint/no-shadow
  //   await page.evaluate(async (key) => {
  //     const event = new KeyboardEvent("keydown", {
  //       key,
  //       keyCode: 179,
  //       bubbles: true,
  //     })
  //     const event2 = new KeyboardEvent("keyup", {
  //       key,
  //       keyCode: 179,
  //       bubbles: true,
  //     })
  //     document.body.dispatchEvent(event)
  //     document.body.dispatchEvent(event2)
  //   }, key)

  //   // return page.keyboard.press(key)
  // }

  async function logPressedKeys() {
    page.evaluate(() => {
      document.addEventListener("keydown", console.log)
    })
  }

  async function stopLoggingPressedKeys() {
    page.evaluate(() => {
      document.removeEventListener("keydown", console.log)
    })
  }
}
