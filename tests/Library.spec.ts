import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest"

import { launchElectron } from "./Helper"
import { createBasePage } from "./POM/BasePage"
import { createLibrarySettingsPage } from "./POM/LibrarySettingsPage"

import type { ElectronApplication } from "playwright"

let electron: ElectronApplication

beforeAll(async () => {
  electron = await launchElectron()

  const basePage = await createBasePage(electron)

  basePage.resetTo.settingsLibrary()
})

afterAll(async () => {
  await electron.close()
})

beforeEach(async () => {
  const basePage = await createBasePage(electron)
  await basePage.resetTo.settingsLibrary()
})

it("can add a folder", async () => {
  const nameToAdd = "testdata/folder"

  const settingsPage = await createLibrarySettingsPage(electron)
  await settingsPage.removeAllFolders()

  await settingsPage.addFolder(nameToAdd)

  const [folderName] = await settingsPage.getFolderNames()

  expect(folderName).toBe(nameToAdd)
})

describe("when removing all folders after having folders added", async () => {
  beforeEach(async () => {
    const settingsPage = await createLibrarySettingsPage(electron)

    await settingsPage.setDefaultFolders()
    await settingsPage.closeAllNotifications()
    await settingsPage.saveAndSyncFolders()

    await settingsPage.resetMusic()
  })

  it("has no current track", async () => {
    const settingsPage = await createLibrarySettingsPage(electron)

    const currentTrack = await settingsPage.playbar.getCurrentTrack()

    expect(currentTrack).toBe(undefined)
  })

  it("does not have a queue", async () => {
    const settingsPage = await createLibrarySettingsPage(electron)

    const queue = await settingsPage.queuebar.getItems()

    expect(queue.length).toBe(0)
  })

  it("has no tracks in the tracks page", async () => {
    const settingsPage = await createLibrarySettingsPage(electron)

    const tracksPage = await settingsPage.goTo.tracks()

    const hasTracks = await tracksPage.hasTracks()

    expect(hasTracks).toBe(false)
  })
})

describe("when removing all folders and instead adding new ones", async () => {
  beforeEach(async () => {
    const settingsPage = await createLibrarySettingsPage(electron)
    await settingsPage.resetMusic()

    await settingsPage.addFolder(1)
    await settingsPage.addFolder(2)
    await settingsPage.closeAllNotifications()
    await settingsPage.saveAndSyncFolders()
  })

  it("does not have a queue", async () => {
    const settingsPage = await createLibrarySettingsPage(electron)
    const tracksPage = await settingsPage.goTo.tracks()
    await tracksPage.playTrack("10")
    await tracksPage.goTo.settingsLibrary()

    await settingsPage.removeAllFolders()
    await settingsPage.addFolder(0)
    await settingsPage.closeAllNotifications()
    await settingsPage.saveAndSyncFolders()

    const queue = await settingsPage.queuebar.getItems()

    expect(queue.length).toBe(0)
  })
})

describe("when removing one folder", async () => {
  beforeEach(async () => {
    const settingsPage = await createLibrarySettingsPage(electron)
    await settingsPage.setDefaultFolders()
    await settingsPage.saveAndSyncFolders()
  })

  it("does delete the tracks from the folder in the queue", async () => {
    const settingsPage = await createLibrarySettingsPage(electron)

    const trackPage = await settingsPage.goTo.tracks()
    await trackPage.playTrack("01")

    await trackPage.goTo.settingsLibrary()

    await settingsPage.removeFolder(0)
    await settingsPage.closeAllNotifications()
    await settingsPage.saveAndSyncFolders()

    const foldersAddedToQueue = await settingsPage.queuebar.getAddedFolders()

    expect(foldersAddedToQueue.indexOf(0)).toBe(-1)
  })

  it("does delete the tracks from the folder in the tracks page", async () => {
    const settingsPage = await createLibrarySettingsPage(electron)

    await settingsPage.removeFolder(0)
    await settingsPage.closeAllNotifications()
    await settingsPage.saveAndSyncFolders()

    const tracksPage = await settingsPage.goTo.tracks()

    const addedFolders = await tracksPage.getAddedFolders()

    expect(addedFolders).toEqual([1, 2])
  })

  it("changes the current track if it came from the removed folder", async () => {
    const settingsPage = await createLibrarySettingsPage(electron)
    const tracksPage = await settingsPage.goTo.tracks()

    await tracksPage.playTrack("00")
    const oldCurrentTrack = await settingsPage.playbar.getCurrentTrack()

    await tracksPage.goTo.settingsLibrary()

    await settingsPage.removeFolder(0)

    await settingsPage.closeAllNotifications()
    await settingsPage.saveAndSyncFolders()

    const newCurrentTrack = await settingsPage.playbar.getCurrentTrack()

    expect(newCurrentTrack).not.toBe(oldCurrentTrack)
  })
})

describe("when adding one folder from a clear state", async () => {
  beforeEach(async () => {
    const settingsPage = await createLibrarySettingsPage(electron)
    await settingsPage.resetMusic()
    await settingsPage.reload()
  })

  it("only adds the newly added tracks to the track page", async () => {
    const expectedTitles = Array.from({ length: 10 }, (_, index) => `0${index}`)

    const settingsPage = await createLibrarySettingsPage(electron)

    await settingsPage.addFolder(0)
    await settingsPage.closeAllNotifications()
    await settingsPage.saveAndSyncFolders()

    const tracksPage = await settingsPage.goTo.tracks()

    const titles = await tracksPage.getTracksTitles()

    expect(titles).toStrictEqual(expectedTitles)
  })
})
