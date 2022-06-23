import { beforeEach, describe, expect, it, vi } from "vitest"
import mockElectronApi from "./MockElectronApi"
import queueStore, {
  removeIndex,
  mapTracksToQueueItem,
  remapIndexes,
} from "@/lib/stores/QueueStore"
import trackFactory from "./factories/trackFactory"
import queueItemFactory from "./factories/queueItemFactory"

vi.stubGlobal("api", mockElectronApi)

afterEach(async () => {
  vi.resetModules()
})

beforeEach(async () => {
  // Set up mock data
  queueStore.set(queueItemFactory.buildList(25))
  queueItemFactory.rewindSequence()
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
    const continueFromIndex = 10

    const newItems = remapIndexes(queueItems, continueFromIndex)

    expect(() => {
      return newItems.every(
        (item, i) => item.index === continueFromIndex + 1 + i
      )
    }).toBeTruthy()
  })

  it("creates a ´new symbol for the mapped items", async () => {
    const queueItems = queueItemFactory.buildList(20)
    const continueFromIndex = 10

    const newItems = remapIndexes(queueItems, continueFromIndex)

    for (let i = 10; i < 20; i++) {
      expect(newItems[i].queueID).to.not.equal(queueItems[i].queueID)
    }
  })
})

describe("fn: deleteIndex", async () => {
  it("does return an array with the correct length", async () => {
    const queueItems = queueItemFactory.buildList(20)
    const indexes = [0, 1, 2, 3]

    const newItems = removeIndex(queueItems, indexes)

    expect(newItems).toHaveLength(16)
  })

  it("deletes the items correctly", async () => {
    const queueItems = queueItemFactory.buildList(20)
    const indexes = [0, 1, 2, 3]

    const newItems = removeIndex(queueItems, indexes)

    for (const [i, item] of newItems.entries()) {
      expect(item.track.title).toBe(queueItems[4 + i].track.title)
    }
  })

  it("deletes a single item correctly", async () => {
    queueItemFactory.rewindSequence()
    const queueItems = queueItemFactory.buildList(20)
    const index = 2

    const newItems = removeIndex(queueItems, index)

    expect(newItems[index].track.title).toBe(queueItems[index + 1].track.title)
  })

  it("remaps the indexes correctly", async () => {
    queueItemFactory.rewindSequence()
    const queueItems = queueItemFactory.buildList(20)
    const indexes = [2, 3, 8]

    const newItems = removeIndex(queueItems, indexes)

    for (const [index, item] of newItems.entries()) {
      expect(item.index).toBe(index)
    }
  })
})
