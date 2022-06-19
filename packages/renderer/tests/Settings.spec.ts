import { TEST_IDS as id } from "../src/TestConsts"
import { fireEvent, render, waitFor, screen } from "@testing-library/svelte"
import { beforeEach, describe, expect, it, vi } from "vitest"
import mockElectronApi, { mockedApiTracks } from "./MockElectronApi"
import "./setupBasicMocks"
import mockedPlayer from "./mocks/AudioPlayer"
import { tick, type SvelteComponentDev } from "svelte/internal"

vi.mock("@/lib/manager/AudioPlayer", () => {
  return { default: mockedPlayer }
})
vi.stubGlobal("api", mockElectronApi)

let Settings: typeof SvelteComponentDev

afterEach(() => {
  vi.resetModules()
})

beforeEach(async () => {
  vitest.resetModules()

  Settings = (await import(
    "@/lib/pages/Settings.svelte"
  )) as unknown as typeof SvelteComponentDev
})

it("submits the audio folders", async () => {
  const desiredFolders = await window.api.getUserSetting("musicFolders")

  const dom = render(Settings)

  const syncButton = dom.getByTestId(id.settingsFoldersSaveButton)
  // Wait for onMount to execute
  await tick()
  await tick()
  await tick()

  await fireEvent.click(syncButton)
  await tick() // Just to be safe
  await tick()
  await tick()

  expect(window.api.setUserSettings).toHaveBeenNthCalledWith(
    1,
    "musicFolders",
    desiredFolders
  )
})

it("calls the sync process", async () => {
  vi.mocked(window.api.sync).mockReset()

  const dom = render(Settings)

  const syncButton = dom.getByTestId(id.settingsFoldersSaveButton)
  // Wait for onMount to execute
  await tick()
  await tick()
  await tick()

  await fireEvent.click(syncButton)
  await tick() // Just to be safe
  await tick()
  await tick()

  expect(window.api.sync).toHaveBeenCalledOnce()
})
