import { get, writable } from "svelte/store"

import type { ITrack } from "@sing-types/Types"

import type { IQueueItem } from "@/types/Types"

function createQueueStore() {
  const { subscribe, set, update } = writable<IQueueItem[]>([])

  return {
    removeIndex,
    intersectCurrentWithNewTracks,
    reset,
    setTracks,
    subscribe,
    update,
    addToNext,
  }

  // ! TODO doimplement this
  function addToNext(playIndex: number, tracks: ITrack | readonly ITrack[]) {
    update(($items) => {
      const playedTracks = $items.slice(0, playIndex)
      const nextTracks = $items.slice(playIndex)
    })
  }

  /**
   * Removes all items from the queue, which are not included in the new ones.
   * This is used to remove deleted tracks from the queue after a sync update.
   * @param newTrackItems The available track items
   * @param currentIndex The current index of the playback
   * @returns The new index to set.
   */
  function intersectCurrentWithNewTracks(
    newTrackItems: readonly ITrack[],
    currentIndex: number
  ): number {
    const { newQueue, newIndex } = _intersectWithItems(
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
   * @param queueIndex The current play index. Used internally to determine which manually added tracks are already played and thus should be removed.
   * @param keepManuallyAddedTracks Wether to keep manually added tracks or not. Defaults to `true`.
   */
  function setTracks(
    tracks: readonly ITrack[],
    queueIndex: number,
    keepManuallyAddedTracks = true
  ): void {
    update(($queue) => {
      const [newCurrent, ...newQueueItems]: readonly IQueueItem[] = tracks.map(
        _convertTrackToQueueItem(0)
      )

      return [
        newCurrent,
        ...(keepManuallyAddedTracks
          ? _getUnplayedManuallyAddedTracks($queue, queueIndex)
          : []),
        ...newQueueItems,
      ]
    })
  }
}

function _getUnplayedManuallyAddedTracks(
  queue: IQueueItem[],
  queueIndex: number
) {
  return queue.slice(queueIndex).filter((item) => item.isManuallyAdded)
}

/**
 * Designed to be used with `Array.map`
 */
function _convertTrackToQueueItem(
  continueFromIndex: number
): (track: ITrack, index: number) => IQueueItem {
  return (track, index) => ({
    index: continueFromIndex + index,
    queueID: Symbol(`${track?.title} queueID`),
    track,
    isManuallyAdded: false,
  })
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

function _intersectWithItems(
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

export const queueStore = createQueueStore()
