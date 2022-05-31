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
import trackFactory from "./factories/trackFactory"

const mockedTracks = trackFactory.buildList(20)

vi.mock("@/lib/manager/AudioPlayer", () => {
  return { default: mockedPlayer }
})
vi.stubGlobal("api", mockElectronApi)

import {
  currentTrack,
  nextTracks,
  playState,
} from "@/lib/manager/PlayerManager"
import { get } from "svelte/store"

let QueueBarComponent: typeof SvelteComponentDev

beforeEach(async () => {
  vitest.resetModules()

  QueueBarComponent = (await import(
    "@/lib/organisms/QueueBar.svelte"
  )) as unknown as typeof SvelteComponentDev
})

describe("with valid data", async () => {
  beforeEach(async () => {
    vitest
      .mocked(window.api.getTracks)
      .mockImplementation(async (): Promise<ITrack[]> => mockedTracks)
  })

  describe("displays", async () => {
    it("displays upcoming queue items", async () => {
      const { container } = render(QueueBarComponent)
      const elements = container.querySelectorAll(group.asQuery.queueNextTracks)

      expect(elements.length >= 1).toBeTruthy()
    })

    it("displays no played queue items yet", async () => {
      const { container } = render(QueueBarComponent)
      const elements = container.querySelectorAll(group.queuePreviousTracks)

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
          const data = Array(21).fill(mockedTracks).flat()
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

      const desiredAmount = Math.min(mockedTracks.length - 1, 20) // Current track takes one spot

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

      const $nextTracks = get(nextTracks)
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

  describe("does", async () => {
    describe("play", async () => {
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

        expect(
          () => nextTrack.innerText !== newNextTrack.innerText
        ).toBeTruthy()
      })
    })

    //TODO implement remove queue item
    describe("click delete queue item", async () => {
      it("removes queue item", async () => {
        const component = render(QueueBarComponent)

        const nextTrack = component.getByTestId(id.queueNextTrack)
        const deleteIcon = nextTrack.querySelector(
          group.asQuery.queueItemDeleteIcon
        )

        if (!deleteIcon) throw new Error("No delete icon found for queue item") // for typescript

        await fireEvent.click(deleteIcon)

        const newNextTrack = component.getByTestId(id.queueNextTrack)

        expect(nextTrack.textContent).not.toEqual(newNextTrack.textContent)
      })

      it("keeps the current track when already played items get removed", async () => {
        const component = render(QueueBarComponent)
        const oldNextTrack = component.getByTestId(id.queueNextTrack)

        await fireEvent.dblClick(oldNextTrack)

        const previousTrack = component.getByTestId(id.queuePreviousTrack)
        const deleteIcon = previousTrack.querySelector(
          group.asQuery.queueItemDeleteIcon
        )
        const oldCurrentTrack = component.getByTestId(id.queueCurrentTrack)

        if (!deleteIcon) throw new Error("No delete icon found")
        await fireEvent.click(deleteIcon)

        const newCurrentTrack = component.getByTestId(id.queueCurrentTrack)

        expect(newCurrentTrack.textContent).toBe(oldCurrentTrack.textContent)
      })

      it("goes to the next track if the current track gets deleted", async () => {
        const component = render(QueueBarComponent)
        const oldNextTrack = component.getByTestId(id.queueNextTrack)

        const oldCurrentTrack = component.getByTestId(id.queueCurrentTrack)
        const deleteIcon = oldCurrentTrack.querySelector(
          group.asQuery.queueItemDeleteIcon
        )

        if (!deleteIcon) throw new Error("No delete icon found for queue item")
        await fireEvent.click(deleteIcon)

        const newCurrentTrack = component.getByTestId(id.queueCurrentTrack)

        if (!oldNextTrack.textContent)
          throw new Error(
            "oldCurrentTrack.textContent should be text, but is" +
              oldNextTrack.textContent
          )

        expect(newCurrentTrack.textContent).toMatch(oldNextTrack.textContent)
      })

      it("removes the correct track after current track has been deleted multiple times", async () => {
        const component = render(QueueBarComponent)

        const amountToRemove = 5

        for (let i = 0; i < amountToRemove; i++) {
          const oldCurrentTrack = component.getByTestId(id.queueCurrentTrack)
          const oldNextTrack = component.getByTestId(id.queueNextTrack)

          const deleteIcon = oldCurrentTrack.querySelector(
            group.asQuery.queueItemDeleteIcon
          )
          if (!deleteIcon)
            throw new Error("No delete icon found for queue item")
          await fireEvent.click(deleteIcon)

          const newCurrentTrack = component.getByTestId(id.queueCurrentTrack)

          expect(
            newCurrentTrack.textContent,
            `Failed at deletion: ${i + 1}`
          ).toBe(oldNextTrack.textContent)
        }
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
