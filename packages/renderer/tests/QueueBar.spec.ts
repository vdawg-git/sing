import { TEST_IDS as id, TEST_GROUPS as group } from "../src/Consts"
import {
  render,
  fireEvent,
  waitForElementToBeRemoved,
  act,
  screen,
} from "@testing-library/svelte"
import { beforeEach, describe, expect, it, vi } from "vitest"
import "./setupBasicMocks"
import mockElectronApi from "./MockElectronApi"
import mockedPlayer from "./mocks/AudioPlayer"
import type { SvelteComponentDev } from "svelte/internal"
import type { ITrack } from "@sing-types/Track"
import mockedTracksData from "./MockTracksData"
vi.mock("@/lib/manager/AudioPlayer", () => {
  return { default: mockedPlayer }
})
vi.stubGlobal("api", mockElectronApi)

import { currentTrack, nextTracks } from "@/lib/manager/PlayerManager"
import { get } from "svelte/store"

let QueueBarComponent: typeof SvelteComponentDev

beforeEach(async () => {
  vitest.resetModules()

  QueueBarComponent = (await import(
    "@/lib/organisms/QueueBar.svelte"
  )) as unknown as typeof SvelteComponentDev
})

describe("behaves correctly when the queue has valid tracks", async () => {
  beforeEach(async () => {
    vitest
      .mocked(window.api.getTracks)
      .mockImplementation(async (): Promise<ITrack[]> => mockedTracksData)
  })

  describe("displays", async () => {
    it("displays upcoming queue items", async () => {
      const { container } = render(QueueBarComponent)
      const elements = container.querySelectorAll(group.asQuery.queueNextTracks)

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

      const currentTrackData = get(currentTrack)

      expect(() =>
        currentTrackElement.innerText.includes(
          currentTrackData.track.title ||
            currentTrackData.track.filepath.split("/").at(-1) ||
            "Track title is string and empty!!" // should not match
        )
      ).toBeTruthy()
      expect(() =>
        currentTrackElement.innerText.includes(
          currentTrackData.track.artist || "Unknown" // Unknown should never match with the current test data
        )
      ).toBeTruthy()
    })

    it("has one current track", async () => {
      const queueBar = render(QueueBarComponent)
      const { container } = queueBar

      expect(
        container.querySelectorAll(id.asQuery.queueCurrentTrack),
        "There is more than one current track"
      ).lengthOf(1)
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

      expect(nextTrackElements.length).toBeGreaterThan(1)

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
    it("switches to the track when it is double clicked", async () => {
      const component = render(QueueBarComponent)

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

      expect(() => nextTrack.innerText !== newNextTrack.innerText).toBeTruthy()
    })

    //TODO implement remove queue item
    describe("click delete queue item", async () => {
      it("removes queue item", async () => {
        const component = render(QueueBarComponent)

        const track = component.getByTestId(id.queueNextTrack)
        const deleteIcon = track.querySelector(
          group.asQuery.queueItemDeleteIcon
        )

        if (!deleteIcon) throw new Error("No delete icon found for queue item") // for typescript

        await fireEvent.doubleClick(deleteIcon)

        expect(waitForElementToBeRemoved(track)).to.not.toThrow()
      })

      it("remaps the indexes", async () => {
        const component = render(QueueBarComponent)
        const previousIndex = get(nextTracks)[0].index

        const track = component.getByTestId(id.queueNextTrack)
        const deleteIcon = track.querySelector(
          group.asQuery.queueItemDeleteIcon
        )

        if (!deleteIcon) throw new Error("No delete icon found for queue item") // for typescript

        await fireEvent.click(deleteIcon)

        const newIndex = get(nextTracks)[0].index

        expect(newIndex).toBe(previousIndex)
      })

      it("goes to the next track if the current track gets deleted", async () => {
        const component = render(QueueBarComponent)
        const oldNextTrack = get(nextTracks)[0]
        if (!oldNextTrack.track.title)
          throw new Error("No track title found for queue item") // for typescript
        const oldNextTitle = oldNextTrack.track.title

        const oldCurrentTrack = component.getByTestId(id.queueCurrentTrack)
        const deleteIcon = oldCurrentTrack.querySelector(
          group.asQuery.queueItemDeleteIcon
        )

        if (!deleteIcon) throw new Error("No delete icon found for queue item")
        await fireEvent.click(deleteIcon)

        const newCurrentTrack = component.getByTestId(id.queueCurrentTrack)

        expect(newCurrentTrack.innerText).toMatch(oldNextTitle)
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
