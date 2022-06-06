import { fireEvent, render, type RenderResult } from "@testing-library/svelte"
import { describe, expect, it } from "vitest"
import { TEST_IDS as id, testAttr } from "@/TestConsts"
import MockedApi from "./MockElectronApi"
import type { SvelteComponentDev } from "svelte/internal"

vi.stubGlobal("api", MockedApi)

let FoldersPicker: typeof SvelteComponentDev

beforeEach(async () => {
  FoldersPicker = (await import(
    "@/lib/organisms/FoldersPicker.svelte"
  )) as unknown as typeof SvelteComponentDev
})

afterEach(async () => {
  vi.resetModules()
})

it("display two folder buttons at the beginning", () => {
  const dom = render(FoldersPicker)

  const amount = getInputs(dom).length

  expect(amount).toBe(1)
})

it("displays no paths at the start", async () => {
  const dom = render(FoldersPicker)
  const folderPicker = dom.getByTestId(id.settingsFolders)

  const slashesInTextAmount = folderPicker.textContent?.matchAll(/\//g)

  expect(slashesInTextAmount).lengthOf(0)
})

it("can add a new folder", async () => {
  const dom = render(FoldersPicker)
  const emptyFolderButton = dom.getAllByText("Add folder", { exact: false })[0]

  await fireEvent.click(emptyFolderButton)

  const folderInputs = getInputs(dom)

  expect(folderInputs).lengthOf(3)
})

it("adds the folder with the provided path", async () => {
  const providedPath = "C:/test/test"
  vi.mocked(window.api.openMusicFolder).mockImplementationOnce(async () => {
    return {
      canceled: false,
      filePaths: [providedPath],
    }
  })

  const dom = render(FoldersPicker)
  const emptyInput = getInputs(dom)[1]

  await fireEvent.click(emptyInput)

  const updatedButton = getInputs(dom)[1]

  expect(updatedButton.textContent).contain(providedPath)
})

it("can remove a folder", async () => {
  const dom = render(FoldersPicker)
  const emptyFolderButton = getInputs(dom)[1]

  await fireEvent.click(emptyFolderButton) //adds new folder by calling window.api.openMusicFolder

  const newButton = getInputs(dom)[2]
  const removeIcon = newButton.querySelector(
    testAttr.asQuery.folderInputDeleteIcon
  )

  if (!removeIcon)
    throw new Error("removeIcon could not be found: " + removeIcon)

  await fireEvent.click(removeIcon)

  const newFolders = getInputs(dom)

  expect(newFolders).lengthOf(2)
})

it("correctly adds multiple folders", async () => {
  const foldersToAdd = ["A:/AAAA", "B:/BBBB", "C:/CCCCC", "D:DDDD"]

  const dom = render(FoldersPicker)

  for (const path of foldersToAdd) {
    await addFolder(dom, path)
  }

  const newInputs = getInputs(dom)

  for (const [index, input] of newInputs.entries()) {
    if (index === newInputs.length - 1) return // dont check the last "Add folder" input

    expect(input.textContent).toContain(foldersToAdd[index])
  }
})

it("correctly removes a folder after multiple got added", async () => {
  const foldersToAdd = ["A:/AAAA", "B:/BBBB", "C:/CCCCC", "D:DDDD"]
  const indexToRemove = 1 // B:BBBB
  const desiredFolders = foldersToAdd.filter(
    (_, index) => index !== indexToRemove
  )

  const dom = render(FoldersPicker)

  for (const path of foldersToAdd) {
    await addFolder(dom, path)
  }

  const inputToRemove = getInputs(dom)[indexToRemove]

  await fireEvent.click(inputToRemove)

  const newInputs = getInputs(dom)

  for (const [index, input] of newInputs.entries()) {
    if (index === newInputs.length - 1) return // dont check the last "Add folder" input

    expect(input.textContent).toContain(desiredFolders[index])
  }
})

it("has a `Add folder...` input at the end after multiple got added", async () => {
  const foldersToAdd = ["A:/AAAA", "B:/BBBB", "C:/CCCCC", "D:DDDD"]

  const dom = render(FoldersPicker)

  for (const path of foldersToAdd) {
    await addFolder(dom, path)
  }

  const lastInput = Array.from(getInputs(dom)).at(-1)

  if (lastInput === undefined) throw new Error("No inputs were found")

  expect(lastInput.textContent).toContain("Add folder")
})

//* Helper functions *//

async function addFolder(dom: RenderResult, folderPath: string) {
  vi.mocked(window.api.openMusicFolder).mockImplementationOnce(async () => {
    return { filePaths: [folderPath], canceled: false }
  })

  const buttonToClick = dom.getAllByText("Add folder", { exact: false })[1]

  await fireEvent.click(buttonToClick)
}

function getInputs(dom: RenderResult) {
  const folders = dom.container.querySelectorAll(testAttr.asQuery.folderInput)

  return folders
}
