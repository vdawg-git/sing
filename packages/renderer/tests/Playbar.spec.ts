import { testIDs as id } from "./Consts"
import { cleanup, fireEvent, render, screen } from "@testing-library/svelte"
import c from "ansicolor"
// import Playbar from "@/lib/organisms/Playbar.svelte"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { readable, writable } from "svelte/store"
import MockElectronApi from "./MockElectronApi"
import mockedPlayer from "./mocks/Player"
import MockTracksData from "./MockTracksData"
// import Playbar from "@/lib/organisms/Playbar.svelte"

vi.mock("@/lib/manager/Player", () => mockedPlayer)

window.api = MockElectronApi

beforeAll(() => {
  global.Audio = vi.fn().mockImplementation(() => 1)
})

describe("Playbar", async () => {
  const Playbar = await import("@/lib/organisms/Playbar.svelte")

  describe("behaves correctly with undefined current track", () => {
    beforeAll(() => {
      vi.mock("@/lib/stores/TracksStore", () => {
        return { default: readable([]) }
      })
    })

    afterAll(async () => vi.unmock("@/lib/stores/TracksStore"))

    describe("displays no meta data", () => {
      it("does not display artist when store is undefined", () => {
        // @ts-expect-error
        const playbar = render(Playbar)

        expect(playbar.queryByTestId(id.playbarArtist)).toBeNull()
      })

      it("does not display album when store is undefined", () => {
        // @ts-expect-error
        const playbar = render(Playbar)
        expect(playbar.queryByTestId(id.playbarAlbum)).toBeNull()
      })

      it("does not display album cover when store is undefined", () => {
        // @ts-expect-error
        const playbar = render(Playbar)
        expect(
          playbar.queryByTestId(id.playbarCover)?.nodeName !== "IMAGE"
        ).toBeTruthy()
      })
    })

    describe("does not have playback functionality", async () => {
      it("Play button is disabled when store is undefined", () => {
        // @ts-expect-error
        const playbar = render(Playbar)
        expect(
          playbar.getByTestId(id.playbarPlayButton)?.hasAttribute("disabled")
        ).toBeTruthy()
      })

      it("Back button is disabled when store is undefined", () => {
        // @ts-expect-error
        const playbar = render(Playbar)
        expect(
          playbar.getByTestId(id.playbarBackButton).hasAttribute("disabled")
        ).toBeTruthy()
      })

      it("Next button is disabled when store is undefined", () => {
        // @ts-expect-error
        const playbar = render(Playbar)
        expect(
          playbar.getByTestId(id.playbarNextButton).hasAttribute("disabled")
        ).toBeTruthy()
      })

      it("Loop mode button is disabled when store is undefined", () => {
        // @ts-expect-error
        const playbar = render(Playbar)
        expect(
          playbar.getByTestId(id.playbarLoopIcon).hasAttribute("disabled")
        ).toBeTruthy()
      })

      it("Play mode button is disabled when store is undefined", () => {
        // @ts-expect-error
        const playbar = render(Playbar)
        expect(
          playbar.getByTestId(id.playbarModeIcon).hasAttribute("disabled")
        ).toBeTruthy()
      })

      it("Volume button is disabled when store is undefined", () => {
        // @ts-expect-error
        const playbar = render(Playbar)
        expect(
          playbar.getByTestId(id.playbarVolumeIcon).hasAttribute("disabled")
        ).toBeTruthy()
      })

      it("Queue button is disabled when store is undefined", () => {
        // @ts-expect-error
        const playbar = render(Playbar)
        expect(
          playbar.getByTestId(id.playbarQueueIcon).hasAttribute("disabled")
        ).toBeTruthy()
      })
    })

    describe("displays current time and duration correctly", async () => {
      it("Track current time is empty when store is undefined", () => {
        // @ts-expect-error
        const playbar = render(Playbar)
        expect(
          playbar.getByTestId(id.seekbarCurrentTime).innerText === undefined
        ).toBeTruthy()
      })

      it("Track duration is empty when store is undefined", () => {
        // @ts-expect-error
        const playbar = render(Playbar)
        expect(
          playbar.getByTestId(id.seekbaarDuriation).innerText === undefined
        ).toBeTruthy()
      })

      it("Progressbar is at 0% when store is undefined", () => {
        // @ts-expect-error
        const playbar = render(Playbar)
        expect(
          playbar.getByTestId(id.seekbarProgressbar).style.width === "0%"
        ).toBeTruthy()
      })
    })
  })
  describe.todo("behaves correctly with valid currentTrack", async () => {
    beforeEach(() => {
      vi.mock("@/lib/stores/TracksStore", () => {
        return { default: readable(MockTracksData) }
      })
    })

    afterAll(() => vi.unmock("@/lib/stores/Tracks"))
  })
})
