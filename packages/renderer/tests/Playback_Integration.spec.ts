import { TEST_IDS as id, TEST_GROUPS as group } from "../src/Consts"
import {
  render,
  fireEvent,
  waitForElementToBeRemoved,
  act,
  screen,
  cleanup,
} from "@testing-library/svelte"
import { beforeEach, describe, expect, it, vi } from "vitest"
import mockElectronApi from "./MockElectronApi"
import mockedPlayer from "./mocks/AudioPlayer"
import type { SvelteComponentDev } from "svelte/internal"
import type { ITrack } from "@sing-types/Track"
import mockedTracksData from "./MockTracksData"
vi.mock("@/lib/manager/AudioPlayer", () => {
  return { default: mockedPlayer }
})
vi.stubGlobal("api", mockElectronApi)

let QueueBarComponent: typeof SvelteComponentDev
let PlayBarComponent: typeof SvelteComponentDev

beforeEach(() => {
  vitest.resetModules()
})

afterEach(() => cleanup())

describe("playbar and queuebar", async () => {
  beforeEach(async () => {
    vitest
      .mocked(window.api.getTracks)
      .mockImplementation(async (): Promise<ITrack[]> => mockedTracksData)

    QueueBarComponent = (await import(
      "@/lib/organisms/QueueBar.svelte"
    )) as unknown as typeof SvelteComponentDev

    PlayBarComponent = (await import(
      "@/lib/organisms/Playbar.svelte"
    )) as unknown as typeof SvelteComponentDev
  })

  test("current track title is in sync", async () => {
    render(PlayBarComponent)
    await fireEvent.click(screen.getByTestId(id.playbarQueueIcon))

    expect(
      screen.getByTestId(id.playbarTitle).textContent ===
        screen.getByTestId(id.queueCurrentTrackTitle).textContent
    )
  })
  test("current track artist is in sync", async () => {
    render(PlayBarComponent)
    await fireEvent.click(screen.getByTestId(id.playbarQueueIcon))

    expect(
      screen.getByTestId(id.playbarArtist).textContent ===
        screen.getByTestId(id.queueCurrentTrackArtist).textContent
    )
  })

  test("Title is in sync when playing next track", async () => {
    render(PlayBarComponent)
    await fireEvent.click(screen.getByTestId(id.playbarQueueIcon))

    const oldQueueCurrentTrack = screen.getByTestId(
      id.queueCurrentTrack
    ).textContent

    const playNextButton = screen.getByTestId(id.playbarNextButton)
    await fireEvent.click(playNextButton)

    const newPlaybarTitle = screen.getByTestId(id.playbarTitle).textContent
    const newQueueCurrentTrack = screen.getByTestId(
      id.queueCurrentTrackTitle
    ).textContent

    expect(
      oldQueueCurrentTrack !== newQueueCurrentTrack,
      "Queuebar title stayed the same"
    ).toBeTruthy()
    expect(
      newPlaybarTitle === newQueueCurrentTrack,
      "Playbar title and queue title are not in sync"
    ).toBeTruthy()
  })

  test("Previous title becomes current title when playing next track", async () => {
    render(PlayBarComponent)
    await fireEvent.click(screen.getByTestId(id.playbarQueueIcon))

    const oldNextTitle = screen.getByTestId(id.queueNextTrackTitle).textContent
    const playNextButton = screen.getByTestId(id.playbarNextButton)

    await fireEvent.click(playNextButton)

    const newPlaybarTitle = screen.getByTestId(id.playbarTitle).textContent
    const newQueueCurrentTitle = screen.getByTestId(
      id.queueCurrentTrackTitle
    ).textContent

    expect(
      newPlaybarTitle === oldNextTitle,
      "Playbar title has not become the correct one"
    ).toBeTruthy()

    expect(
      newQueueCurrentTitle === oldNextTitle,
      "Playbar title has not become the correct one"
    ).toBeTruthy()
  })
})
