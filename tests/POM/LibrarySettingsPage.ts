import type { ElectronApplication, Locator } from "playwright"
import createSettingsBasePage from "./SettingsBasePage"
import {
  TEST_IDS as id,
  testAttr,
} from "../../packages/renderer/src/TestConsts"
import { join } from "path"
import type { AllowedIndexes } from "@sing-types/Types"

export default async function createLibrarySettingsPage(
  electron: ElectronApplication
) {
  const defaultFolders = [
    join(__dirname, "../testdata/folder0"),
    join(__dirname, "../testdata/folder1"),
    join(__dirname, "../testdata/folder2"),
  ] as const
  const emptyFolder = join(__dirname, "../testdata/empty")

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
    syncWithNoFolders,
  }

  async function syncWithNoFolders() {
    await page.evaluate(() => window.api.setUserSettings("musicFolders", []))
  }

  async function resetToDefault() {
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
    const deleteIcons = await page.$$(testAttr.asQuery.folderInputDeleteIcon)

    for (const folder of deleteIcons) {
      await folder.click({ timeout: 2000 })
    }
  }

  async function getFolderElements() {
    const folderElements = await page.$$(testAttr.asQuery.folderInput)

    return folderElements
  }

  async function isDisplayed(): Promise<boolean> {
    return folders.isVisible()
  }

  async function addFolder(
    folder: string | AllowedIndexes<typeof defaultFolders>
  ): Promise<void> {
    if (typeof folder === "string") {
      return await setFolderPath(emptyInput, [folder])
    }

    const pathToAdd = defaultFolders[folder]
    return await setFolderPath(emptyInput, [pathToAdd])
  }

  async function editFolder(
    folderpath: string,
    folderIndex: number = 0
  ): Promise<void> {
    const folder = (await getFolderElements())[folderIndex]

    await settingsBase.mockDialog([folderpath])

    await folder.click({ timeout: 2000 })
  }

  async function removeFolder(folderIndex: number): Promise<void> {
    const folder = (await getFolderElements())[folderIndex]

    const deleteIcon = await folder.$(testAttr.asQuery.folderInputDeleteIcon)

    if (!deleteIcon)
      throw new Error(`could not find deleteIcon, it is: ${deleteIcon}`)

    await deleteIcon.click({ timeout: 2000 })
  }

  async function getFolderNames(): Promise<string[]> {
    const folderNames = Promise.all(
      (await page.$$(testAttr.asQuery.folderInput)).map((node) =>
        node.innerText()
      )
    )

    return folderNames
  }

  async function saveAndSyncFolders() {
    await saveButton.click({ timeout: 2000 })
    await page.waitForTimeout(1050)
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
