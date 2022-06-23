import type { ElectronApplication } from "playwright"
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest"
import { launchElectron } from "./Helper"
import createBasePage from "./POM/BasePage"
import createLibrarySettingsPage from "./POM/LibrarySettingsPage"

let electron: ElectronApplication

beforeAll(async () => {
  electron = await launchElectron()

  const basePage = await createBasePage(electron)

  basePage.resetTo("settings/library")
})

afterAll(async () => {
  await electron.close()
})

beforeEach(async () => {
  const basePage = await createBasePage(electron)
  await basePage.resetTo("settings/library")
})

it("can add a folder", async () => {
  const nameToAdd = "testdata/folder"

  const settingsPage = await createLibrarySettingsPage(electron)
  await settingsPage.removeAllFolders()

  await settingsPage.addFolder(nameToAdd)

  const folderName = (await settingsPage.getFolderNames())[0]

  expect(folderName).toBe(nameToAdd)
})

describe("when removing all folders after having folders added", async () => {
  beforeEach(async () => {
    const settingsPage = await createLibrarySettingsPage(electron)

    await settingsPage.setDefaultFolders()
    await settingsPage.saveAndSyncFolders()

    await settingsPage.resetMusic()
  })

  it("has no current track", async () => {
    const settingsPage = await createLibrarySettingsPage(electron)

    const currentTrack = await settingsPage.getCurrentTrack()

    expect(currentTrack).toBe(undefined)
  })

  it("does not have a queue", async () => {
    const settingsPage = await createLibrarySettingsPage(electron)

    const queue = await settingsPage.getQueueItems()

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
    await settingsPage.saveAndSyncFolders()
  })

  it("does not have a queue", async () => {
    const settingsPage = await createLibrarySettingsPage(electron)
    const tracksPage = await settingsPage.goTo.tracks()
    await tracksPage.playTrack("10_")
    await tracksPage.goTo.settings()

    await settingsPage.removeAllFolders()
    await settingsPage.addFolder(0)
    await settingsPage.saveAndSyncFolders()

    const queue = await settingsPage.getQueueItems()

    expect(queue.length).toBe(0)
  })
})

describe("when removing one folder", async () => {
  beforeEach(async () => {
    const settingsPage = await createLibrarySettingsPage(electron)
    await settingsPage.setDefaultFolders()
    await settingsPage.saveAndSyncFolders()
  })

  it.only("does delete the tracks from the folder in the queue", async () => {
    const settingsPage = await createLibrarySettingsPage(electron)

    const trackPage = await settingsPage.goTo.tracks()
    await trackPage.playTrack("01_")

    await trackPage.goTo.settings()

    // await settingsPage.removeFolder(0)
    await settingsPage.saveAndSyncFolders()

    const foldersAddedToQueue = await settingsPage.getQueueAddedFolders()

    expect(foldersAddedToQueue.indexOf(0)).toBe(-1)
  })

  it("does delete the tracks from the folder in the tracks page", async () => {
    const settingsPage = await createLibrarySettingsPage(electron)

    await settingsPage.removeFolder(0)
    await settingsPage.saveAndSyncFolders()

    const tracksPage = await settingsPage.goTo.tracks()

    const foldersAddedTotracks = await tracksPage.getAddedFolders()

    expect(foldersAddedTotracks.indexOf(0)).toBe(-1)
  })

  it("changes the current track if it came from the removed folder", async () => {
    const settingsPage = await createLibrarySettingsPage(electron)
    const oldCurrentTrack = await settingsPage.getCurrentTrack()

    const tracksPage = await settingsPage.goTo.tracks()

    await tracksPage.playTrack("00_")

    await tracksPage.goTo.settings()

    await settingsPage.removeFolder(0)
    await settingsPage.saveAndSyncFolders()

    const newCurrentTrack = await settingsPage.getCurrentTrack()

    expect(newCurrentTrack).not.toBe(oldCurrentTrack)
  })
})
describe("when adding one folder from a clear state", async () => {
  beforeEach(async () => {
    const settingsPage = await createLibrarySettingsPage(electron)
    await settingsPage.resetMusic()
  })

  it("only adds the newly added tracks to the track page", async () => {
    const expectedTitles = Array.from({ length: 10 }, (_, index) => "0" + index)

    const settingsPage = await createLibrarySettingsPage(electron)

    await settingsPage.addFolder(0)
    await settingsPage.saveAndSyncFolders()

    const tracksPage = await settingsPage.goTo.tracks()

    const titles = await tracksPage.getTracksTitles()

    expect(titles).toStrictEqual(expectedTitles)
  })
})
