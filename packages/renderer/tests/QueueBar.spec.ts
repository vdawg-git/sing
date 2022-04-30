import { testIDs as id, testGroups as group } from "./Consts"
import { fireEvent, render } from "@testing-library/svelte"
import c from "ansicolor"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { readable, writable } from "svelte/store"
import mockElectronApi from "./MockElectronApi"
import mockedPlayer from "./mocks/Player"
import mockTracksData from "./MockTracksData"
import type { SvelteComponentDev } from "svelte/internal"
import tracksStore from "@/lib/stores/TracksStore"

vi.mock("@/lib/manager/Player", () => mockedPlayer)
vi.mock("@/lib/stores/TracksStore", () => {
  return {
    default: { subscribe: vi.fn(writable(mockTracksData).subscribe) },
  }
})

vi.mocked(tracksStore.subscribe).mockImplementation((callback) => {
  console.log("Mocked callback called")

  callback([])

  return vi.fn()
})

import QueueBarComponent from "@/lib/organisms/QueueBar.svelte"
window.api = mockElectronApi

// const tracksStoreSpy = vi.spyOn(tracksStore, "subscribe")

// tracksStoreSpy.mockImplementation((callback) => {
//   console.log("Mock store to be empty")

//   callback([])

//   return vi.fn()
// })

describe("behaves correctly when the queue has valid tracks", async () => {
  beforeEach(async () => {
    console.log(c.magenta("beforeEach Queue filled"))
  })

  it("displays upcoming queue items", async () => {
    console.log(c.magenta("Queue  filled test"))
    console.log((await window.api.getTracks()).length)

    const { container } = render(QueueBarComponent, { show: true })
    const elements = container.querySelectorAll(
      `[data-testgroup=${group.queueNextTracks}]`
    )

    expect(elements.length >= 1).toBeTruthy()
  })

  it("displays no played queue items yet", async () => {
    console.log(c.magenta("Queue  filled test"))

    const { container } = render(QueueBarComponent, { show: true })
    const elements = container.querySelectorAll(
      `[data-testgroup=${group.queueUPreviousTracks}]`
    )

    expect(elements.length === 0).toBeTruthy()
  })

  it("displays the 'Play queue' title", async () => {
    console.log(c.magenta("Queue  filled test"))

    const queueBar = render(QueueBarComponent, { show: true })

    expect(queueBar.getByText("Play queue")).toBeTruthy()
  })

  it("displays the current track", async () => {
    console.log(c.magenta("Queue  filled test"))

    const queueBar = render(QueueBarComponent, { show: true })

    expect(queueBar.getByTestId(id.queueCurrentTrack)).toBeTruthy()
  })
})

describe("behaves correctly when queue is empty", async () => {
  beforeEach(async () => {
    console.log(c.blue("beforeEach Queue empty"))

    window.api.getTracks = async () => []
  })

  afterEach(() => {
    window.api.getTracks = async () => mockTracksData
  })

  it("does not display items as already played", () => {
    console.log(c.blue("Queue empty test"))

    const { container } = render(QueueBarComponent, { show: true })

    const elements = container.querySelectorAll(
      `[data-testgroup=${group.queueUPreviousTracks}]`
    )

    expect(elements.length === 0).toBeTruthy()
  })

  it("does not display items as upcoming", async () => {
    console.log(c.blue("Queue empty test"))
    console.log(await window.api.getTracks())

    const component = render(QueueBarComponent, { show: true })

    const container = component.container

    const elements = container.querySelectorAll(
      `[data-testgroup=${group.queueNextTracks}]`
    )

    expect(elements.length === 0).toBeTruthy()
  })

  it("does not display current playing", async () => {
    console.log(c.blue("Queue empty test"))

    const component = render(QueueBarComponent, { show: true })

    expect(() => component.getByTestId(id.queueCurrentTrack)).toThrowError(
      "Unable to find an element by: [data-testid="
    )
  })
})
