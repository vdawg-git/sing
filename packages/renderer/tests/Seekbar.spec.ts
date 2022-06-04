import { TEST_IDS as id } from "@/TestConsts"
import { render } from "@testing-library/svelte"
import { beforeEach, describe, expect, it, vi } from "vitest"
import mockElectronApi from "./MockElectronApi"
import "./setupBasicMocks"
import { convertDisplayTimeToSeconds } from "../../../tests/Helper"
import mockedPlayer from "./mocks/AudioPlayer"
import type { SvelteComponentDev } from "svelte/internal"

vi.mock("@/lib/manager/AudioPlayer", () => {
  return { default: mockedPlayer }
})
vi.stubGlobal("api", mockElectronApi)

let Seekbar: typeof SvelteComponentDev

afterEach(() => {
  vi.resetModules()
})

beforeEach(async () => {
  Seekbar = (await import(
    "@/lib/molecules/Seekbar.svelte"
  )) as unknown as typeof SvelteComponentDev
})

describe("check testids", async () => {
  it("has the knob id", async () => {
    const dom = render(Seekbar, { currentTime: 0, duration: 100 })
    expect(dom.getByTestId(id.seekbarProgressbarKnob))
  })
  it("has the seekbar id", async () => {
    const dom = render(Seekbar, { currentTime: 0, duration: 100 })
    expect(dom.getByTestId(id.seekbar))
  })
  it("has the progressbar id", async () => {
    const dom = render(Seekbar, { currentTime: 0, duration: 100 })
    expect(dom.getByTestId(id.seekbarProgressbar))
  })
  it("has the totalDuration id", async () => {
    const dom = render(Seekbar, { currentTime: 0, duration: 100 })
    expect(dom.getByTestId(id.seekbarTotalDuration))
  })
  it("has the currentTime id", async () => {
    const dom = render(Seekbar, { currentTime: 0, duration: 100 })
    expect(dom.getByTestId(id.seekbarCurrentTime))
  })
})

describe("displays the progress", async () => {
  it("displays the correct width for the progressbar when track is at the end", async () => {
    const dom = render(Seekbar, { currentTime: 100, duration: 100 })

    const width = dom.getByTestId(id.seekbarProgressbar).style.width

    expect(width).toBe(100 + "%")
  })

  it("displays the correct width for the progressbar when track is at the beginning", async () => {
    const dom = render(Seekbar, { currentTime: 0, duration: 100 })

    const width = dom.getByTestId(id.seekbarProgressbar).style.width

    expect(width).toBe(0 + "%")
  })

  it("displays the correct width for the progressbar when track is at the middle", async () => {
    const dom = render(Seekbar, { currentTime: 50, duration: 100 })

    const width = dom.getByTestId(id.seekbarProgressbar).style.width

    expect(width).toBe(50 + "%")
  })

  it("displays the correct currentTime", async () => {
    const timeToTest = 40
    const dom = render(Seekbar, { currentTime: timeToTest, duration: 100 })

    const currentTime = convertDisplayTimeToSeconds(
      dom.getByTestId(id.seekbarCurrentTime).textContent || ""
    )

    expect(currentTime).toBe(timeToTest)
  })

  it("displays the correct duration", async () => {
    const timeToTest = 140
    const dom = render(Seekbar, { currentTime: 10, duration: timeToTest })

    const totalDuration = convertDisplayTimeToSeconds(
      dom.getByTestId(id.seekbarTotalDuration).textContent || ""
    )

    expect(totalDuration).toBe(timeToTest)
  })
})
