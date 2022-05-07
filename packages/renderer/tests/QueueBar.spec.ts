import { TEST_IDS as id, TEST_GROUPS as group } from "../src/Consts"
import {
  render,
  fireEvent,
  waitForElementToBeRemoved,
  act,
  screen,
} from "@testing-library/svelte"
import { beforeEach, describe, expect, it, vi } from "vitest"
import mockElectronApi from "./MockElectronApi"
import mockedPlayer from "./mocks/Player"
import type { SvelteComponentDev } from "svelte/internal"
import type { ITrack } from "@sing-types/Track"
import mockedTracksData from "./MockTracksData"
vi.mock("@/lib/manager/AudioPlayer", () => {
  return { default: mockedPlayer }
})
vi.stubGlobal("api", mockElectronApi)

import { currentTrack, nextTracks } from "@/lib/manager/PlayerManager"

let QueueBarComponent: typeof SvelteComponentDev

beforeEach(() => {
  vitest.resetModules()
})

describe("behaves correctly when the queue has valid tracks", async () => {
  beforeEach(async () => {
    QueueBarComponent = (await import(
      "@/lib/organisms/QueueBar.svelte"
    )) as unknown as typeof SvelteComponentDev

    vitest
      .mocked(window.api.getTracks)
      .mockImplementation(async (): Promise<ITrack[]> => mockedTracksData)
  })

  describe("displays", async () => {
    it("displays upcoming queue items", async () => {
      const { container } = render(QueueBarComponent)
      const elements = container.querySelectorAll(group.queueNextTracks)

      expect(elements.length >= 1).toBeTruthy()
    })

    it("displays no played queue items yet", async () => {
      const { container } = render(QueueBarComponent)
      const elements = container.querySelectorAll(group.queueUPreviousTracks)

      expect(elements.length === 0).toBeTruthy()
    })

    it("displays the 'Play queue' title", async () => {
      const queueBar = render(QueueBarComponent)

      expect(queueBar.getByText("Play queue")).toBeTruthy()
    })

    it("displays the current track", async () => {
      const queueBar = render(QueueBarComponent)

      expect(queueBar.getByTestId(id.queueCurrentTrack)).toBeTruthy()
    })

    it("displays a maximum of 20 upcoming tracks", async () => {
      vitest
        .mocked(window.api.getTracks)
        .mockImplementationOnce(async (): Promise<ITrack[]> => {
          const data = Array(21).fill(mockedTracksData).flat()
          return data
        })

      vitest.resetModules()

      QueueBarComponent = (await import(
        "@/lib/organisms/QueueBar.svelte"
      )) as unknown as typeof SvelteComponentDev

      const queueBar = render(QueueBarComponent)

      expect(
        queueBar.container.querySelectorAll(group.queueNextTracks).length <= 20
      ).toBeTruthy()
    })

    it("displays the current track correctly", async () => {
      const queueBar = render(QueueBarComponent)
      const currentTrackElement = queueBar.getByTestId(id.queueCurrentTrack)

      const unsub = currentTrack.subscribe(($currentTrack) => {
        const { track } = $currentTrack

        expect(() =>
          currentTrackElement.innerText.includes(
            track.title ||
              track.filepath.split("/").at(-1) ||
              "Track title is string and empty!!" // should not match
          )
        ).toBeTruthy()
        expect(() =>
          currentTrackElement.innerText.includes(
            track.artist || "Unknown" // Unknown should never match
          )
        ).toBeTruthy()
      })
      unsub()
    })

    it("has one current track", async () => {
      const queueBar = render(QueueBarComponent)
      const { container } = queueBar

      if (container.querySelectorAll(id.asQuery.queueCurrentTrack).length !== 1)
        throw new Error("There is more than one current track")
    })

    it("displays the correct amount of upcoming tracks", async () => {
      const queueBar = render(QueueBarComponent)
      const { container } = queueBar

      const desiredAmount = Math.min(mockedTracksData.length - 1, 20) // Current track takes one spot

      expect(
        container.querySelectorAll(group.asQuery.queueNextTracks).length ===
          desiredAmount
      ).toBeTruthy()
    })

    it("displays the upcoming tracks from the queue", async () => {
      const queueBar = render(QueueBarComponent)
      const { container } = queueBar
      const nextTrackElements = container.querySelectorAll(
        group.asQuery.queueNextTracks
      )

      nextTracks.subscribe(($nextTracks) => {
        for (const [index, queueItem] of nextTrackElements.entries()) {
          expect(() =>
            queueItem.textContent?.includes(
              $nextTracks[index].track?.title ||
                $nextTracks[index].track.filepath.split("/").at(-1) ||
                "TS dont cry"
            )
          ).toBeTruthy()
        }
      })
    })
  })

  describe("does", async () => {
    it.todo(
      "switches tracks when double clicking the next in-queue item",
      async () => {
        const component = render(QueueBarComponent)

        const previousTrack = component.getByTestId(id.queuePreviousTrack)
        const currentTrack = component.getByTestId(id.queueCurrentTrack)
        const nextTrack = component.getByTestId(id.queueNextTrack)

        await fireEvent.doubleClick(nextTrack)

        const newPreviousTrack = component.getByTestId(id.queuePreviousTrack)
        const newCurrentTrack = component.getByTestId(id.queueCurrentTrack)
        const newNextTrack = component.getByTestId(id.queueNextTrack)

        expect(
          () => currentTrack.innerText === newPreviousTrack.innerText
        ).toBeTruthy()

        expect(
          () => nextTrack.innerText === newCurrentTrack.innerText
        ).toBeTruthy()

        expect(
          () => previousTrack.innerText !== newPreviousTrack.innerText
        ).toBeTruthy()

        expect(
          () => nextTrack.innerText !== newNextTrack.innerText
        ).toBeTruthy()
      }
    )

    it.todo(
      "switches tracks when clicking the previously played queue item",
      async () => {
        const component = render(QueueBarComponent)

        // Go one forward as to being able to go backward again
        await fireEvent.doubleClick(component.getByTestId(id.queueNextTrack))

        const previousTrack = component.getByTestId(id.queuePreviousTrack)
        const currentTrack = component.getByTestId(id.queueCurrentTrack)
        const nextTrack = component.getByTestId(id.queueNextTrack)

        await fireEvent.doubleClick(previousTrack)

        const newPreviousTrack = component.getByTestId(id.queuePreviousTrack)
        const newCurrentTrack = component.getByTestId(id.queueCurrentTrack)
        const newNextTrack = component.getByTestId(id.queueNextTrack)

        expect(
          () => currentTrack.innerText === newNextTrack.innerText
        ).toBeTruthy()

        expect(() => previousTrack.innerText !== newCurrentTrack.innerText)

        expect(
          () => nextTrack.innerText === newNextTrack.innerText
        ).toBeTruthy()

        expect(
          () => previousTrack.innerText !== newPreviousTrack.innerText
        ).toBeTruthy()
      }
    )

    //TODO implement remove queue item
    it.todo("removes a queue item when clicking its delete icon", async () => {
      const component = render(QueueBarComponent)

      const track = component.getByTestId(id.queueNextTrack)
      const deleteIcon = track.querySelector(group.queueItemDeleteIcon)

      if (!deleteIcon) throw new Error("No delete icon found for queue item")

      await fireEvent.doubleClick(deleteIcon)

      waitForElementToBeRemoved(() => {
        component.queryByText(/.*/)
      })
    })

    it.todo(
      "reorders the queue when an item inside it is dragged within it",
      async () => {
        throw new Error("not implemented")
      }
    )

    it.todo(
      "does not change the queue when an item inside it is dragged outside it",
      async () => {
        throw new Error("not implemented")
      }
    )
  })
})

describe("behaves correctly when queue is empty", async () => {
  beforeEach(async () => {
    // Mock response to be empty and regenerate the import || clear its cache
    vitest.mocked(window.api.getTracks).mockImplementation(async () => [])
    vitest.resetModules()

    QueueBarComponent = (await import(
      "@/lib/organisms/QueueBar.svelte"
    )) as unknown as typeof SvelteComponentDev
  })

  it("does not display items as already played", () => {
    const { container } = render(QueueBarComponent)

    const elements = container.querySelectorAll(group.queueUPreviousTracks)

    expect(elements.length === 0).toBeTruthy()
  })

  it("does not display items as upcoming", async () => {
    const component = render(QueueBarComponent)

    const container = component.container

    const elements = container.querySelectorAll(group.queueNextTracks)

    expect(elements.length === 0).toBeTruthy()
  })

  it("does not display current playing", async () => {
    const component = render(QueueBarComponent)

    expect(() => component.getByTestId(id.queueCurrentTrack)).toThrowError(
      `Unable to find an element by: [data-testid="${id.queueCurrentTrack}"`
    )
  })
})
