import path from "node:path"

import { TEST_IDS as id, testAttributes } from "../../packages/renderer/src/TestConsts"
import createSettingsBasePage from "./SettingsBasePage"

/* eslint-disable unicorn/prefer-dom-node-text-content */
/* eslint-disable no-await-in-loop */
import type { ElectronApplication, Locator } from "playwright"
import type { AllowedIndexes } from "@sing-types/Types"

export default async function createLibrarySettingsPage(
  electron: ElectronApplication
) {
  const defaultFolders = [
    path.join(__dirname, "../testdata/folder0"),
    path.join(__dirname, "../testdata/folder1"),
    path.join(__dirname, "../testdata/folder2"),
  ] as const
  const emptyFolder = path.join(__dirname, "../testdata/empty")

  const settingsBase = await createSettingsBasePage(electron)
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
    isDisplayed,
    removeAllFolders,
    removeFolder,
    saveAndSyncFolders,
    setDefaultFolders,
    resetToDefault,
  }

  async function resetToDefault() {
    await settingsBase.resetMusic()

    await setDefaultFolders()
    await saveAndSyncFolders()
  }

  async function setDefaultFolders() {
    await removeAllFolders()

    for (const folder of defaultFolders) {
      await addFolder(folder)
    }
  }

  async function removeAllFolders() {
    const deleteIcons = await page.$$(
      testAttributes.asQuery.folderInputDeleteIcon
    )

    for (const folder of deleteIcons) {
      await folder.click({ timeout: 2000 })
    }
  }

  async function getFolderElements() {
    const folderElements = await page.$$(testAttributes.asQuery.folderInput)

    return folderElements
  }

  async function isDisplayed(): Promise<boolean> {
    return folders.isVisible()
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

  async function removeFolder(folderIndex: number): Promise<void> {
    const folderElements = await getFolderElements()

    const folder = folderElements[folderIndex]

    const deleteIcon = await folder.$(
      testAttributes.asQuery.folderInputDeleteIcon
    )

    if (!deleteIcon)
      throw new Error(`could not find deleteIcon, it is: ${deleteIcon}`)

    await deleteIcon.click({ timeout: 2000 })
  }

  async function getFolderNames(): Promise<string[]> {
    const folderInputElements = await page.$$(
      testAttributes.asQuery.folderInput
    )

    const folderNames = Promise.all(
      folderInputElements.map((node) => node.innerText())
    )

    return folderNames
  }

  async function saveAndSyncFolders() {
    await saveButton.click({ timeout: 2000 })
    await page.waitForTimeout(1050) // Todo Need to implement a "done syncing" notification which can then be awaited
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
