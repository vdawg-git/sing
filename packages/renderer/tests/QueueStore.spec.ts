import { beforeEach, describe, expect, it, vi } from "vitest"

import queueStore, {
  _convertTracksToQueueItem,
  _remapIndexes,
  _removeIndex,
  _removeItemsFromNewTracks,
} from "@/lib/stores/QueueStore"

import queueItemFactory from "./factories/queueItemFactory"
import trackFactory from "./factories/trackFactory"
import mockElectronApi from "./MockElectronApi"

vi.stubGlobal("api", mockElectronApi)

afterEach(async () => {
  vi.resetModules()
})

beforeEach(async () => {
  // Set up mock data
  queueStore.set(queueItemFactory.buildList(25))
  queueItemFactory.rewindSequence()
  trackFactory.rewindSequence()
})

// describe("fn: setUpcomingFromSource", async () => {
//   it.todo("keeps the old played songs", async () => {})
//   it.todo("adds the new items properly", async () => {})
//   it.todo("keeps the old played songs", async () => {})
// })

describe("fn: mapTracks", async () => {
  const tracks = trackFactory.buildList(10)

  it("maps the indexes of the new tracks correctly", async () => {
    const queueItems = _convertTracksToQueueItem(tracks, 5)

    for (const [index, item] of queueItems.entries()) {
      expect(item.index).to.equal(index + 5)
    }
  })
})

describe("fn: remapIndexes", async () => {
  it("returns an array with the correct length", async () => {
    expect(_remapIndexes(queueItemFactory.buildList(20), 10)).to.be.lengthOf(20)
  })

  it("maps the indexes of the new tracks correctly", async () => {
    const queueItems = queueItemFactory.buildList(20)
    const continueFromIndex = 10

    const newItems = _remapIndexes(queueItems, continueFromIndex)

    expect(() =>
      newItems.every(
        (item, index) => item.index === continueFromIndex + 1 + index
      )
    ).toBeTruthy()
  })

  it("creates a new symbol for the mapped items", async () => {
    const queueItems = queueItemFactory.buildList(20)
    const continueFromIndex = 10

    const newItems = _remapIndexes(queueItems, continueFromIndex)

    for (let index = 10; index < 20; index += 1) {
      expect(newItems[index].queueID).to.not.equal(queueItems[index].queueID)
    }
  })
})

describe("fn: deleteIndex", async () => {
  it("does return an array with the correct length", async () => {
    const queueItems = queueItemFactory.buildList(20)
    const indexes = [0, 1, 2, 3]

    const newItems = _removeIndex(queueItems, indexes)

    expect(newItems).toHaveLength(16)
  })

  it("deletes the items correctly", async () => {
    const queueItems = queueItemFactory.buildList(20)
    const indexes = [0, 1, 2, 3]

    const newItems = _removeIndex(queueItems, indexes)

    for (const [index, item] of newItems.entries()) {
      expect(item.track.title).toBe(queueItems[4 + index].track.title)
    }
  })

  it("deletes a single item correctly", async () => {
    const queueItems = queueItemFactory.buildList(20)
    const index = 2

    const newItems = _removeIndex(queueItems, index)

    expect(newItems[index].track.title).toBe(queueItems[index + 1].track.title)
  })

  it("remaps the indexes correctly", async () => {
    const queueItems = queueItemFactory.buildList(20)
    const indexes = [2, 3, 8]

    const newItems = _removeIndex(queueItems, indexes)

    for (const [index, item] of newItems.entries()) {
      expect(item.index).toBe(index)
    }
  })
})

describe("fn: deleteObseleteItemsFromNewTracks", async () => {
  it("deletes the correct items - happy", async () => {
    const indexesToDelete = [4, 8, 9, 15]

    const oldQueueItems = queueItemFactory.buildList(20)
    trackFactory.rewindSequence() // Nessecary as the queueFactory uses the trackFactory

    const trackItems = trackFactory
      .buildList(20)
      .filter((_, index) => !indexesToDelete.includes(index))

    const currentIndex = 2

    const { newQueue } = _removeItemsFromNewTracks(
      oldQueueItems,
      trackItems,
      currentIndex
    )

    for (const index of indexesToDelete) {
      expect(newQueue[index]?.track.id).not.toEqual(
        oldQueueItems[index]?.track.id
      )
    }
  })

  it("returns the correct index if the current track did not get removed - happy", async () => {
    const indexesToDelete = new Set([4, 8, 9, 15, 18])

    const oldQueueItems = queueItemFactory.buildList(20)
    trackFactory.rewindSequence() // Nessecary as the queueFactory uses the trackFactory

    const trackItems = trackFactory
      .buildList(20)
      .filter((_, index) => !indexesToDelete.has(index))

    const currentIndex = 10

    const { newIndex } = _removeItemsFromNewTracks(
      oldQueueItems,
      trackItems,
      currentIndex
    )

    expect(newIndex).toEqual(7)
  })

  it("returns the correct index if the current track did get removed - happy", async () => {
    const indexesToDelete = new Set([0, 2, 4, 10, 15])

    const oldQueueItems = queueItemFactory.buildList(20)
    trackFactory.rewindSequence() // Nessecary as the queueFactory uses the trackFactory

    const trackItems = trackFactory
      .buildList(20)
      .filter((_, index) => !indexesToDelete.has(index))

    const currentIndex = 10

    const { newIndex } = _removeItemsFromNewTracks(
      oldQueueItems,
      trackItems,
      currentIndex
    )

    expect(newIndex).toEqual(5)
  })

  it("returns the index -1 if all new track items are different from the old queue items", async () => {
    const oldQueueItems = queueItemFactory.buildList(20)

    // The queueItemFactory increases the sequence of the trackFacttory, so all IDs are different now
    const trackItems = trackFactory.buildList(20)

    const currentIndex = 10

    const { newIndex } = _removeItemsFromNewTracks(
      oldQueueItems,
      trackItems,
      currentIndex
    )

    expect(newIndex).toEqual(-1)
  })
})
