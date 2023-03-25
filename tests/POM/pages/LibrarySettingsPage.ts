import path from "node:path"
import { fileURLToPath } from "node:url"

import slash from "slash"

import { NOTIFICATION_LABEL } from "@sing-renderer/Constants"
import { TEST_ATTRIBUTES, TEST_IDS as id } from "@sing-renderer/TestConsts"

/* eslint-disable unicorn/prefer-dom-node-text-content */
/* eslint-disable no-await-in-loop */
import type { EndToEndFolder } from "#/Types"
import type { ElectronApplication, Locator } from "playwright"

import { createBaseSettingsPage } from "#pages/SettingsBasePage"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function createLibrarySettingsPage(electron: ElectronApplication) {
  const defaultFolders = [
    path.join(__dirname, "../../testdata/folder0"),
    path.join(__dirname, "../../testdata/folder1"),
    path.join(__dirname, "../../testdata/folder2"),
  ]
  const emptyFolderPath = path.join(__dirname, "../../testdata/empty")

  const settingsBase = await createBaseSettingsPage(electron)
  const page = await electron.firstWindow()

  const foldersWrapper = page.getByTestId(id.settingsFolders),
    emptyInput = page.getByTestId(id.settingsFoldersEmptyInput),
    saveButton = page.getByTestId(id.settingsFoldersSaveButton),
    folderLocator = foldersWrapper.locator(TEST_ATTRIBUTES.asQuery.folderInput),
    deleteButton = folderLocator.locator(
      TEST_ATTRIBUTES.asQuery.folderInputDeleteIcon
    )

  return {
    ...settingsBase,

    addDefaultFolders,
    addEmptyFolder,
    addFolder,
    editFolder,
    emptyLibrary,
    folder: folderLocator,
    foldersWrapper,
    getFolderByLabel,
    removeAllFolders,
    removeFolder,
    resetToDefault,
    saveAndSyncFolders,
    waitToBeVisible,
  }

  async function resetToDefault() {
    await removeAllFolders()
    await addDefaultFolders()
    await saveAndSyncFolders()
  }

  async function emptyLibrary() {
    await removeAllFolders()
    await addEmptyFolder()
    await saveAndSyncFolders()
  }

  async function waitToBeVisible() {
    await folderLocator.first().waitFor({ state: "visible" })
  }

  /**
   * Removes all folders and adds all three test folders. `folder0, folder1, folder2)`
   */
  async function addDefaultFolders() {
    await removeAllFolders()

    for (const folder_ of defaultFolders) {
      await addFolder(folder_)
    }
  }

  /**
   * Does only work when there are folders to delete.
   *
   * Otherwise it will time out and throw an error
   */
  async function removeAllFolders() {
    await folderLocator.first().waitFor({ state: "visible" })

    for (const _ of await deleteButton.all()) {
      await deleteButton.first().click()
    }
    await folderLocator
      .getByText(/testdata/)
      .first()
      .waitFor({ state: "hidden" })
  }

  async function addFolder(
    folderToAdd: EndToEndFolder | string
  ): Promise<void> {
    if (typeof folderToAdd === "string") {
      return setFolderPath(emptyInput, [folderToAdd])
    }

    const pathToAdd = defaultFolders[folderToAdd]
    return setFolderPath(emptyInput, [pathToAdd])
  }

  async function editFolder(
    folderpath: string,
    folderIndex: EndToEndFolder = 0
  ): Promise<void> {
    await settingsBase.mockDialog([folderpath])

    await folderLocator.nth(folderIndex).click()
  }

  async function removeFolder(
    folderToRemove: EndToEndFolder | "empty"
  ): Promise<void> {
    const folderPath =
      typeof folderToRemove === "string"
        ? folderToRemove
        : slash(defaultFolders[folderToRemove])

    await folderLocator
      .filter({ hasText: folderPath })
      .locator(TEST_ATTRIBUTES.asQuery.folderInputDeleteIcon)
      .click({ force: true })
  }

  async function getFolderByLabel(label: string) {
    return foldersWrapper.locator(TEST_ATTRIBUTES.asQuery.folderInput, {
      hasText: label,
    })
  }

  async function saveAndSyncFolders() {
    await saveButton.click()

    await settingsBase.notifications.closeAll()

    await settingsBase.notifications.waitForNotification(
      NOTIFICATION_LABEL.syncSuccess
    )
    await settingsBase.notifications.closeAll()

    // Sometimes it is a bit to fast for the backend to catch up. Not sure why this is
    await page.waitForTimeout(100)
  }

  async function setFolderPath(
    folderToSet: Locator,
    paths: string[]
  ): Promise<void> {
    await settingsBase.mockDialog(paths)

    await folderToSet.click()

    for (const folderPath of paths) {
      const regex = new RegExp(folderPath.replace(/\\|\//g, "."))
      await foldersWrapper.getByText(regex).waitFor({ state: "visible" })
    }
  }

  async function addEmptyFolder() {
    await addFolder(emptyFolderPath)
  }
}
