import { testIDs as id, testGroups as group } from "./Consts"
import { fireEvent, render } from "@testing-library/svelte"
import c from "ansicolor"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { readable, writable } from "svelte/store"
import mockElectronApi from "./MockElectronApi"
import mockedPlayer from "./mocks/Player"
import mockTracksData from "./MockTracksData"
import type { SvelteComponentDev } from "svelte/internal"

vi.mock("@/lib/manager/Player", () => mockedPlayer)
// vi.mock("@/lib/stores/TracksStore", () => {
//   return {
//     default: { subscribe: vi.fn(writable(mockTracksData).subscribe) },
//   }
// })

// vi.mocked(tracksStore.subscribe).mockImplementation((callback) => {
//   console.log("Mocked callback called")

//   callback([])

//   return vi.fn()
// })

vi.stubGlobal("api", mockElectronApi)

let QueueBarComponent: typeof SvelteComponentDev
// afterEach(async () => {
//   vitest.resetModules()
// })

beforeAll(() => {
  vitest.resetModules()
})

describe("behaves correctly when the queue has valid tracks", async () => {
  beforeEach(async () => {
    console.log(c.magenta("beforeEach Queue filled"))

    QueueBarComponent = (await import(
      "@/lib/organisms/QueueBar.svelte"
    )) as unknown as typeof SvelteComponentDev
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

    vitest.mocked(window.api.getTracks).mockImplementation(async () => {
      console.log(c.blue.bgBlack("Get tracks mocked as empty"))

      return []
    })

    QueueBarComponent = (await import(
      "@/lib/organisms/QueueBar.svelte"
    )) as unknown as typeof SvelteComponentDev
  })

  afterEach(async () => {
    vi.resetModules()
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
