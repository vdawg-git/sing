import { testIDs as id } from "./Consts"
import { cleanup, fireEvent, render, screen } from "@testing-library/svelte"
import c from "ansicolor"
// import Playbar from "@/lib/organisms/Playbar.svelte"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { readable, writable } from "svelte/store"
import MockElectronApi from "./MockElectronApi"
import mockedPlayer from "./__mocks__/@/lib/manager/Player"
import MockTracksData from "./MockTracksData"
import type { SvelteComponentDev } from "svelte/internal"

vi.mock("@/lib/manager/Player", () => mockedPlayer)

window.api = MockElectronApi

beforeAll(() => {
  // @ts-expect-error
  global.Audio = vi.fn().mockImplementation(() => 1)
})

describe("QueueBar", async () => {
  const QueueBar = (await import(
    "@/lib/organisms/QueueBar.svelte"
  )) as unknown as typeof SvelteComponentDev

  describe("behaves correctly when queue is empty", () => {
    beforeAll(() =>
      vi.mock("@/lib/stores/TracksStore", () => {
        return { default: readable([]) }
      })
    )

    it("does not display queue items", () => {
      const queueBar = render(QueueBar)

      // @ts-expect-error
      expect(queueBar.querySelector("div")).toBeTruthy()
    })
  })

  describe("behaves correctly with valid queue", () => {})
})
