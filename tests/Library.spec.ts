import { expect, test } from "@playwright/test"

import { UNKNOWN_ARTIST } from "@sing-shared/Consts"

import type { ElectronApplication } from "playwright"

import { launchElectron } from "#/Helper"
import { createBasePage } from "#pages/BasePage"
import { createLibrarySettingsPage } from "#pages/LibrarySettingsPage"

let electron: ElectronApplication

test.beforeAll(async () => {
  electron = await launchElectron()

  const basePage = await createBasePage(electron)

  basePage.resetTo.settingsLibrary()
})

test.afterAll(async () => {
  await electron.close()
})

test.beforeEach(async () => {
  const basePage = await createBasePage(electron)
  await basePage.resetTo.settingsLibrary()
})

test("can add a folder", async () => {
  const nameToAdd = "folderToAdd/Here/"

  const settingsPage = await createLibrarySettingsPage(electron)
  await settingsPage.removeAllFolders()

  await settingsPage.addFolder(nameToAdd)

  await expect(await settingsPage.getFolderByLabel(nameToAdd)).toBeVisible()
})

test.describe("When adding all folders", async () => {
  test.beforeEach(async () => {
    const basePage = await createBasePage(electron)
    const settingsPage = await basePage.resetTo.settingsLibrary()
    await settingsPage.emptyLibrary()
    await settingsPage.addDefaultFolders()
    await settingsPage.saveAndSyncFolders()
  })

  test("should correctly add tracks with an unknown artist and album", async () => {
    const settingsPage = await createLibrarySettingsPage(electron)
    const tracksPage = await settingsPage.goTo.tracks()

    // Nessecary as they still got displayed until a refresh for some reason
    await tracksPage.reload()
    await tracksPage.waitToBeVisible()

    const expectedTitles = ["00", "01", "02", "03"]

    for (const title of expectedTitles) {
      await expect(
        tracksPage.trackList.trackItems.filter({ hasText: `${title}_` })
      ).toBeVisible()
    }
  })

  test("should add `Unknown artist` to artists", async () => {
    const settingsPage = await createLibrarySettingsPage(electron)
    const artistsPage = await settingsPage.goTo.artists()

    const unknownCard = await artistsPage.cards.getCardByTitle(UNKNOWN_ARTIST)

    await expect(unknownCard).toBeVisible()
  })
})

test.describe("when removing all folders after having folders added", async () => {
  test.beforeEach(async () => {
    const basePage = await createBasePage(electron)
    const settingsPage = await basePage.resetTo.settingsLibrary()

    await settingsPage.resetToDefault()
    await settingsPage.emptyLibrary()
  })

  test("has no current track", async () => {
    const settingsPage = await createLibrarySettingsPage(electron)

    await expect(settingsPage.playbar.currentTrackTitle).toBeHidden()
  })

  test("does not have a queue", async () => {
    const settingsPage = await createLibrarySettingsPage(electron)

    await expect(settingsPage.queuebar.allItems).toHaveCount(0, {
      timeout: 2000,
    })
  })

  test("has no tracks in the tracks page", async () => {
    const settingsPage = await createLibrarySettingsPage(electron)

    const tracksPage = await settingsPage.goTo.tracks()

    await expect(tracksPage.trackList.trackItems).toHaveCount(0, {
      timeout: 2000,
    })

    // await tracksPage.pauseOnFailure(test)
  })

  test("has no albums in the albums page", async () => {
    const settingsPage = await createLibrarySettingsPage(electron)

    const albumsPage = await settingsPage.goTo.albums()

    await expect(albumsPage.cards.allCards).toHaveCount(0, { timeout: 2000 })

    if (test.info().errors.length > 0) {
      albumsPage.pauseExecution()
    }
  })

  test("has no artists in the artists page", async () => {
    const settingsPage = await createLibrarySettingsPage(electron)

    const artistsPage = await settingsPage.goTo.artists()

    await expect(artistsPage.cards.allCards).toHaveCount(0, { timeout: 2000 })
  })
})

test.describe("when removing all folders and instead adding new ones", async () => {
  test.beforeEach(async () => {
    const basePage = await createBasePage(electron)
    const settingsPage = await basePage.resetTo.settingsLibrary()

    await settingsPage.emptyLibrary()

    await settingsPage.removeAllFolders()
    await settingsPage.addFolder(1)
    await settingsPage.addFolder(2)

    await settingsPage.saveAndSyncFolders()
  })

  test("does not have a queue", async () => {
    const settingsPage = await createLibrarySettingsPage(electron)
    const tracksPage = await settingsPage.goTo.tracks()

    await tracksPage.trackList.playTrack("10_")
    await tracksPage.goTo.settingsLibrary()

    await settingsPage.removeAllFolders()
    await settingsPage.addFolder(0)

    await settingsPage.saveAndSyncFolders()

    await expect(tracksPage.queuebar.allItems).toHaveCount(0, { timeout: 2000 })
  })
})

test.describe("when removing one folder", async () => {
  test.beforeEach(async () => {
    const basePage = await createBasePage(electron)
    const settingsPage = await basePage.resetTo.settingsLibrary()
    await settingsPage.addDefaultFolders()

    await settingsPage.saveAndSyncFolders()
  })

  test("does delete the tracks from the folder in the queue", async () => {
    const settingsPage = await createLibrarySettingsPage(electron)

    const trackPage = await settingsPage.goTo.tracks()
    await trackPage.trackList.playTrack("01_")

    await trackPage.goTo.settingsLibrary()

    await settingsPage.removeFolder(0)

    await settingsPage.saveAndSyncFolders()
    await settingsPage.queuebar.open()

    await expect(await settingsPage.queuebar.getItemByTitle("00")).toBeHidden()
    await expect(await settingsPage.queuebar.getItemByTitle("05")).toBeHidden()

    await settingsPage.queuebar.close()
  })

  test("does delete the tracks from the folder in the tracks page", async () => {
    const settingsPage = await createLibrarySettingsPage(electron)

    await settingsPage.removeFolder(0)

    await settingsPage.saveAndSyncFolders()

    const tracksPage = await settingsPage.goTo.tracks()

    const tracksFolder0 = await tracksPage.trackList.getByFolder(0)

    await expect(tracksFolder0).toBeHidden()
  })

  test("should change the current track correctly if it came from the removed folder", async () => {
    const settingsPage = await createLibrarySettingsPage(electron)
    const tracksPage = await settingsPage.goTo.tracks()

    // await tracksPage.pauseExecution()

    const trackToPlay = "10_"
    await tracksPage.trackList.playTrack(trackToPlay)

    await expect(
      tracksPage.playbar.currentTrackTitle,
      "Did not play the correct track on click"
    ).toContainText(trackToPlay)

    await tracksPage.goTo.settingsLibrary()

    await settingsPage.removeFolder(1)

    await settingsPage.saveAndSyncFolders()

    await expect(tracksPage.playbar.currentTrackTitle).toContainText("09_")
  })

  test("should delete the albums from the deleted folder - Folder 0", async () => {
    const settingsPage = await createLibrarySettingsPage(electron)

    await settingsPage.removeFolder(0)

    const albumsPage = await settingsPage.goTo.albums()

    await expect(albumsPage.getAlbumsByFolder(0).first()).toBeHidden()
  })

  test("should delete the artists from the deleted folder - Folder 0", async () => {
    const settingsPage = await createLibrarySettingsPage(electron)

    await settingsPage.removeFolder(0)

    const artistsPage = await settingsPage.goTo.artists()

    await expect(artistsPage.getArtistsByFolder(0).first()).toBeHidden()
  })

  test("should delete the albums from the deleted folder - Folder 1", async () => {
    const settingsPage = await createLibrarySettingsPage(electron)

    await settingsPage.removeFolder(1)

    const albumsPage = await settingsPage.goTo.albums()

    await expect(albumsPage.getAlbumsByFolder(1).first()).toBeHidden()
  })

  test("should delete the artists from the deleted folder - Folder 1", async () => {
    const settingsPage = await createLibrarySettingsPage(electron)

    await settingsPage.removeFolder(1)

    const artistsPage = await settingsPage.goTo.artists()

    await expect(artistsPage.getArtistsByFolder(1).first()).toBeHidden()
  })
})

test.describe("when adding one folder from a clear state", async () => {
  test.beforeEach(async () => {
    const basePage = await createBasePage(electron)
    const settingsPage = await basePage.resetTo.settingsLibrary()

    await settingsPage.emptyLibrary()
    await settingsPage.addFolder(0)
    await settingsPage.saveAndSyncFolders()
  })

  test("adds just tracks from the newly added folder to the track page", async () => {
    const expectedTitles = Array.from(
      { length: 10 },
      (_, index) => `0${index}_`
    )

    const settingsPage = await createLibrarySettingsPage(electron)

    const tracksPage = await settingsPage.goTo.tracks()

    for (const title of expectedTitles) {
      await expect(
        tracksPage.trackList.trackItems.filter({ hasText: title })
      ).toBeVisible()
    }

    await expect(
      tracksPage.trackList.trackItems.filter({ hasText: "10_" })
    ).toBeHidden({
      timeout: 2000,
    })
    await expect(
      tracksPage.trackList.trackItems.filter({ hasText: "20_" })
    ).toBeHidden({
      timeout: 2000,
    })
  })
})
