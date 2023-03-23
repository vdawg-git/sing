import path from "node:path"
import { fileURLToPath } from "node:url"

import { NOTIFICATION_LABEL } from "@sing-renderer/Constants"
import { TEST_ATTRIBUTES, TEST_IDS as id } from "@sing-renderer/TestConsts"

/* eslint-disable unicorn/prefer-dom-node-text-content */
/* eslint-disable no-await-in-loop */
import type { ElectronApplication, Locator } from "playwright"
import type { AllowedIndexes } from "@sing-types/Utilities"
import type { EndToEndFolder } from "#/Types"

import { createBaseSettingsPage } from "#pages/SettingsBasePage"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function createLibrarySettingsPage(electron: ElectronApplication) {
  const defaultFolders = [
    path.join(__dirname, "../../testdata/folder0"),
    path.join(__dirname, "../../testdata/folder1"),
    path.join(__dirname, "../../testdata/folder2"),
  ] as const
  const emptyFolderPath = path.join(__dirname, "../../testdata/empty")

  const settingsBase = await createBaseSettingsPage(electron)
  const page = await electron.firstWindow()

  const folders = page.getByTestId(id.settingsFolders),
    emptyInput = page.getByTestId(id.settingsFoldersEmptyInput),
    saveButton = page.getByTestId(id.settingsFoldersSaveButton)

  return {
    ...settingsBase,

    addEmptyFolder,
    addFolder,
    editFolder,
    emptyLibrary,
    folders,
    getFolderByLabel,
    removeAllFolders,
    removeFolder,
    resetToDefault,
    saveAndSyncFolders,
    setDefaultFolders: addDefaultFolders,
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

  /**
   * Removes all folders and adds all three test folders. `folder0, folder1, folder2)`
   */
  async function addDefaultFolders() {
    await removeAllFolders()

    for (const folder of defaultFolders) {
      await addFolder(folder)
    }
  }

  async function removeAllFolders() {
    await page.waitForSelector(TEST_ATTRIBUTES.asQuery.folderInput)

    await recursion()

    async function recursion() {
      const deleteIcon = await page.$(
        TEST_ATTRIBUTES.asQuery.folderInputDeleteIcon
      )

      if (!deleteIcon) return

      await deleteIcon.click({ force: true })

      recursion()
    }
  }

  async function getFolderElements() {
    const folderElements = await page.$$(TEST_ATTRIBUTES.asQuery.folderInput)

    return folderElements
  }

  async function addFolder(
    folder: string | AllowedIndexes<typeof defaultFolders>
  ): Promise<void> {
    if (typeof folder === "string") {
      return setFolderPath(emptyInput, [folder])
    }

    const pathToAdd = defaultFolders[folder]
    return setFolderPath(emptyInput, [pathToAdd])
  }

  async function editFolder(
    folderpath: string,
    folderIndex = 0
  ): Promise<void> {
    const folderElements = await getFolderElements()
    const folder = folderElements[folderIndex]

    await settingsBase.mockDialog([folderpath])

    await folder.click()
  }

  async function removeFolder(
    folderToRemove: EndToEndFolder | "folder0" | "folder1" | "folder2"
  ): Promise<void> {
    if (typeof folderToRemove === "number") {
      const folderElements = await getFolderElements()

      const folder = folderElements[folderToRemove]

      const deleteIcon = await folder.$(
        TEST_ATTRIBUTES.asQuery.folderInputDeleteIcon
      )

      if (!deleteIcon) {
        throw new Error(`could not find deleteIcon, it is: ${deleteIcon}`)
      }

      await deleteIcon.click({ force: true })
    } else {
      const folder = await page.$(
        `${TEST_ATTRIBUTES.asQuery.folderInput}:has-text("${folderToRemove}")`
      )
      const deleteIcon = await folder?.$(
        TEST_ATTRIBUTES.asQuery.folderInputDeleteIcon
      )

      if (!deleteIcon) {
        throw new Error(`could not find deleteIcon, it is: ${deleteIcon}`)
      }

      await deleteIcon.click({ force: true })
    }
  }

  async function getFolderByLabel(label: string) {
    return folders.locator(TEST_ATTRIBUTES.asQuery.folderInput, {
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
  }

  async function setFolderPath(
    folderLocator: Locator,
    paths: string[]
  ): Promise<void> {
    await settingsBase.mockDialog(paths)

    await folderLocator.click()

    for (const folderPath of paths) {
      const regex = new RegExp(folderPath.replace(/\\|\//g, "."))
      await folders.getByText(regex).waitFor({ state: "visible" })
    }
  }

  async function addEmptyFolder() {
    await addFolder(emptyFolderPath)
  }
}
