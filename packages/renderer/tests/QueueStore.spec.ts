import { beforeEach, describe, expect, it, vi } from "vitest"
import { TEST_IDS as id, TEST_GROUPS as group } from "@/Consts"
import {
  render,
  fireEvent,
  waitForElementToBeRemoved,
} from "@testing-library/svelte"

import mockElectronApi from "./MockElectronApi"
import type { ITrack } from "@sing-types/Track"
import mockedTracksData from "./MockTracksData"
import queueStore, {
  deleteIndex,
  mapTracksToQueueItem,
  remapIndexes,
} from "@/lib/stores/QueueStore"
import { get } from "svelte/store"
import trackFactory from "./factories/trackFactory"
import queueItemFactory from "./factories/queueItemFactory"

vi.stubGlobal("api", mockElectronApi)

afterEach(async () => {
  vi.resetModules()
})

beforeEach(async () => {
  // Set up mock data
  queueStore.set(queueItemFactory.buildList(25))
})

describe("fn: setUpcomingFromSource", async () => {
  it.todo("keeps the old played songs", async () => {})
  it.todo("adds the new items properly", async () => {})
  it.todo("keeps the old played songs", async () => {})
})

describe("fn: mapTracks", async () => {
  const tracks = trackFactory.buildList(10)

  it("maps the indexes of the new tracks correctly", async () => {
    const queueItems = mapTracksToQueueItem(tracks, 5)

    for (const [index, item] of queueItems.entries()) {
      expect(item.index).to.equal(index + 5)
    }
  })
})

describe("fn: remapIndexes", async () => {
  it("returns an array with the correct length", async () => {
    expect(remapIndexes(queueItemFactory.buildList(20), 10)).to.be.lengthOf(20)
  })

  it("maps the indexes of the new tracks correctly", async () => {
    const queueItems = queueItemFactory.buildList(20)
    const continueFromIndex = 50

    const newItems = remapIndexes(queueItems, continueFromIndex)

    expect(() => {
      return newItems.every(
        (item, i) => item.index === continueFromIndex + 1 + i
      )
    }).toBeTruthy()
  })
})

describe("fn: removeIndexes", async () => {
  it("does return an array the correct length", async () => {
    const queueItems = queueItemFactory.buildList(20)
    const indexes = [0, 1, 2, 3]

    const newItems = deleteIndex(queueItems, indexes)

    expect(newItems).toHaveLength(16)
  })

  it("deletes the items correctly", async () => {
    const queueItems = queueItemFactory.buildList(20)
    const indexes = [0, 1, 2, 3]

    const newItems = deleteIndex(queueItems, indexes)

    for (const [i, item] of newItems.entries()) {
      expect(item).toBe(queueItems[5 + i])
    }
  })

  it("deletes a single item correctly", async () => {
    const queueItems = queueItemFactory.buildList(20)
    const index = 4

    const newItems = deleteIndex(queueItems, index)

    expect(newItems[4]).toBe(queueItems[5])
  })

  it("remaps the indexes correctly", async () => {
    const queueItems = queueItemFactory.buildList(20)
    const indexes = [2, 3, 8]

    const newItems = deleteIndex(queueItems, indexes)

    for (const [i, item] of newItems.entries()) {
      expect(item.index).toBe(i)
    }
  })
})
