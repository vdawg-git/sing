import { TEST_IDS as id } from "../src/Consts"
import { fireEvent, render, waitFor, screen } from "@testing-library/svelte"
import { beforeEach, describe, expect, it, vi } from "vitest"
import mockElectronApi, { mockedApiTracks } from "./MockElectronApi"
import "./setupBasicMocks"
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

describe("seekbar", async () => {
  // it("changes the current time of the track on click", async () => {
  //   const seekbar = render(Seekbar)
  //    seekbar.
  // })
})
