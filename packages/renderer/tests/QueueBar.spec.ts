import { testIDs as id, testGroups as group } from "./Consts"
import { fireEvent, render } from "@testing-library/svelte"
import { beforeEach, describe, expect, it, vi } from "vitest"
import mockElectronApi from "./MockElectronApi"
import mockedPlayer from "./mocks/Player"
import type { SvelteComponentDev } from "svelte/internal"

vi.mock("@/lib/manager/Player", () => mockedPlayer)
vi.stubGlobal("api", mockElectronApi)

let QueueBarComponent: typeof SvelteComponentDev

afterEach(async () => {
  vitest.resetModules()
})

describe("behaves correctly when the queue has valid tracks", async () => {
  beforeEach(async () => {
    QueueBarComponent = (await import(
      "@/lib/organisms/QueueBar.svelte"
    )) as unknown as typeof SvelteComponentDev
  })

  it("displays upcoming queue items", async () => {
    const { container } = render(QueueBarComponent, { show: true })
    const elements = container.querySelectorAll(
      `[data-testgroup=${group.queueNextTracks}]`
    )

    expect(elements.length >= 1).toBeTruthy()
  })

  it("displays no played queue items yet", async () => {
    const { container } = render(QueueBarComponent, { show: true })
    const elements = container.querySelectorAll(
      `[data-testgroup=${group.queueUPreviousTracks}]`
    )

    expect(elements.length === 0).toBeTruthy()
  })

  it("displays the 'Play queue' title", async () => {
    const queueBar = render(QueueBarComponent, { show: true })

    expect(queueBar.getByText("Play queue")).toBeTruthy()
  })

  it("displays the current track", async () => {
    const queueBar = render(QueueBarComponent, { show: true })

    expect(queueBar.getByTestId(id.queueCurrentTrack)).toBeTruthy()
  })
})

describe("behaves correctly when queue is empty", async () => {
  beforeEach(async () => {
    vitest.mocked(window.api.getTracks).mockImplementation(async () => [])

    QueueBarComponent = (await import(
      "@/lib/organisms/QueueBar.svelte"
    )) as unknown as typeof SvelteComponentDev
  })

  it("does not display items as already played", () => {
    const { container } = render(QueueBarComponent, { show: true })

    const elements = container.querySelectorAll(
      `[data-testgroup=${group.queueUPreviousTracks}]`
    )

    expect(elements.length === 0).toBeTruthy()
  })

  it("does not display items as upcoming", async () => {
    const component = render(QueueBarComponent, { show: true })

    const container = component.container

    const elements = container.querySelectorAll(
      `[data-testgroup=${group.queueNextTracks}]`
    )

    expect(elements.length === 0).toBeTruthy()
  })

  it("does not display current playing", async () => {
    const component = render(QueueBarComponent, { show: true })

    expect(() => component.getByTestId(id.queueCurrentTrack)).toThrowError(
      `Unable to find an element by: [data-testid="${id.queueCurrentTrack}"`
    )
  })
})
