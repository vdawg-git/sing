import path from "node:path"

import { NOTIFICATION_LABEL } from "../../packages/renderer/src/Constants"
import {
  TEST_ATTRIBUTES,
  TEST_IDS as id,
} from "../../packages/renderer/src/TestConsts"

import { createBaseSettingsPage } from "./SettingsBasePage"

/* eslint-disable unicorn/prefer-dom-node-text-content */
/* eslint-disable no-await-in-loop */
import type { ElectronApplication, Locator } from "playwright"
import type { AllowedIndexes } from "@sing-types/Utilities"

export async function createLibrarySettingsPage(electron: ElectronApplication) {
  const defaultFolders = [
    path.join(__dirname, "../testdata/folder0"),
    path.join(__dirname, "../testdata/folder1"),
    path.join(__dirname, "../testdata/folder2"),
  ] as const
  const emptyFolder = path.join(__dirname, "../testdata/empty")

  const settingsBase = await createBaseSettingsPage(electron)
  const page = await electron.firstWindow()

  const folders = page.locator(id.asQuery.settingsFolders)
  const emptyInput = page.locator(id.asQuery.settingsFoldersEmptyInput)
  const saveButton = page.locator(id.asQuery.settingsFoldersSaveButton)

  return {
    ...settingsBase,

    addEmpyFolder,
    addFolder,
    editFolder,
    getFolderNames,
    removeAllFolders,
    removeFolder,
    resetToDefault,
    saveAndSyncFolders,
    setDefaultFolders,
    waitToBeVisible,
  }

  async function resetToDefault() {
    await settingsBase.resetMusic()

    await setDefaultFolders()
    await saveAndSyncFolders()
    await settingsBase.reload()
  }

  /**
   * Adds all three test folders. `folder0, folder1, folder2)`
   */
  async function setDefaultFolders() {
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

      await deleteIcon.click({ timeout: 2000, force: true })

      recursion()
    }
  }

  async function getFolderElements() {
    const folderElements = await page.$$(TEST_ATTRIBUTES.asQuery.folderInput)

    return folderElements
  }

  async function waitToBeVisible(): Promise<void> {
    return folders.waitFor({ timeout: 1000 })
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

    await folder.click({ timeout: 2000 })
  }

  async function removeFolder(
    folderToRemove: number | "folder0" | "folder1" | "folder2"
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

      await deleteIcon.click({ timeout: 2000, force: true })
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

      await deleteIcon.click({ timeout: 2000, force: true })
    }
  }

  async function getFolderNames(): Promise<string[]> {
    const folderInputElements = await page.$$(
      TEST_ATTRIBUTES.asQuery.folderInput
    )

    const folderNames = Promise.all(
      folderInputElements.map((node) => node.innerText())
    )

    return folderNames
  }

  async function saveAndSyncFolders() {
    await saveButton.click({ timeout: 2000 })
    await settingsBase.waitForNotification(NOTIFICATION_LABEL.syncSuccess)
    await page.waitForTimeout(1850) // Hack - Give the store time to complete to update. Need to think of a better way to do this
  }

  async function setFolderPath(
    folderLocator: Locator,
    paths: string[]
  ): Promise<void> {
    await settingsBase.mockDialog(paths)

    await folderLocator.click({ timeout: 2000 })
  }

  async function addEmpyFolder() {
    await addFolder(emptyFolder)
  }
}
