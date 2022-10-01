import { get, writable } from "svelte/store"

import type { IQueueItem } from "@/types/Types"
import type { ITrack } from "@sing-types/Types"

function createQueueStore() {
  const { subscribe, set, update } = writable<IQueueItem[]>([])

  return {
    removeIndex,
    removeItemsFromNewTracks,
    reset,
    setCurrent,
    setTracks,
    subscribe,
    update,
  }

  function removeItemsFromNewTracks(
    newTrackItems: readonly ITrack[],
    currentIndex: number
  ): number {
    const { newQueue, newIndex } = _removeItemsFromNewTracks(
      get({ subscribe }),
      newTrackItems,
      currentIndex
    )

    set(newQueue)

    return newIndex
  }

  function removeIndex(index: number | readonly number[]) {
    update(($queue) => _removeIndex($queue, index))
  }

  function reset(): void {
    set([])
  }

  /**
   *
   * @param tracks The tracks to add as IQueueItems
   * @param queueIndex The current index of the queue. It will add the tracks after it
   * @param isKeepingManuallyAddedTracks Wether to keep manually added tracks or not.
   */
  function setTracks(
    tracks: readonly ITrack[],
    queueIndex: number,
    isKeepingManuallyAddedTracks = true
  ): void {
    update(($queue) => {
      const [newCurrent, ...newQueueItems]: readonly IQueueItem[] =
        _convertTracksToQueueItem(tracks, 0)

      return [
        newCurrent,
        ...(isKeepingManuallyAddedTracks
          ? _getUnplayedManuallyAddedTracks($queue, queueIndex)
          : []),
        ...newQueueItems,
      ]
    })
  }

  function setCurrent(track: ITrack, index: number) {
    update(($queue) => {
      const newQueueItem: IQueueItem = {
        index,
        isManuallyAdded: false,
        track,
        queueID: Symbol(`${track?.title} queueID`),
      }
      $queue.splice(index, 0, newQueueItem)
      return $queue
    })
  }
}

function _getUnplayedManuallyAddedTracks(
  queue: IQueueItem[],
  queueIndex: number
) {
  return queue.slice(queueIndex).filter((item) => item.isManuallyAdded)
}

function _convertTracksToQueueItem(
  tracks: readonly ITrack[],
  continueFromIndex: number
): IQueueItem[] {
  return tracks.map((track, index) => ({
    index: continueFromIndex + index,
    queueID: Symbol(`${track?.title} queueID`),
    track,
    isManuallyAdded: false,
  }))
}

function _remapIndexes(
  queueItems: readonly IQueueItem[],
  indexToStart = 0
): IQueueItem[] {
  return [...queueItems].map((item, index) => {
    const newIndex = indexToStart + index

    return {
      ...item,
      index: newIndex,
      queueID: Symbol(`${newIndex} ${item.track?.title || "Unknown"}`),
    }
  })
}

function _removeIndex(
  queueItems: readonly IQueueItem[],
  indexes: readonly number[] | number
): IQueueItem[] {
  const cleaned = remove(queueItems, indexes)

  return _remapIndexes(cleaned)
}

function remove(
  queueItems: readonly IQueueItem[],
  indexes: number | readonly number[]
) {
  if (typeof indexes === "number") {
    const result = [...queueItems]
    result.splice(indexes, 1)
    return result
  }

  return queueItems.filter((_, index) => !indexes.includes(index))
}

function _removeItemsFromNewTracks(
  queueItems: readonly IQueueItem[],
  newTrackItems: readonly ITrack[],
  currentIndex: number
) {
  const trackIDs = new Set(newTrackItems.map((track) => track.id))

  const deletedIndexes: number[] = []
  const newQueue = _remapIndexes(
    queueItems.filter((item, index) => {
      if (trackIDs.has(item.track.id)) return true

      deletedIndexes.push(index)
      return false
    })
  )

  const toReduceCurrentIndex =
    deletedIndexes.filter((index) => index <= currentIndex).length +
    (deletedIndexes.includes(currentIndex) ? 1 : 0)

  const newIndex =
    currentIndex - toReduceCurrentIndex < -1
      ? -1
      : currentIndex - toReduceCurrentIndex

  return { newIndex, newQueue }
}

const queue = createQueueStore()

export default queue
