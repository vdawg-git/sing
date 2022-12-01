import { get, writable } from "svelte/store"

import type { ITrack } from "@sing-types/DatabaseTypes"

import type { IQueueItem } from "@/types/Types"

/**
 * The queue which gets filled up automatically.
 * For example, a user plays an album and the queue fills up with tracks from that album.
 */
function createAutoQueueStore() {
  const { subscribe, set, update } = writable<readonly IQueueItem[]>([])

  return {
    removeIndex,
    intersectCurrentWithNewTracks,
    clear,
    setTracks,
    subscribe,
    update,
  }

  // TODO make the queue store generic and create a normal queue and a "manuallyAddedQueue".
  // When after a track ends the "manuallyAddedQueue" is not empty, start playing from "manuallyAddedQueue".
  // Does this count as a playback? Does it change the state?

  // What to do when switching playback?
  // Check if the "manuallyAddedQueue" has items, if yes ask to keep it or to delete it.

  // What to do when auto switching tracks?
  // Check if the "manuallyAddedQueue" has items, if yes, set it to the current queue track and play from there.
  // But if the current track is already from the manuallyAddedQueue then delete it from the manuallyAddedQueue and play the next inside the manuallyAddedQueue.

  // How to compute the currrent track?
  // This is decided on how the index is calculated.. More to come

  // The playback functions are generic and get passed the current queue store ("default" and "manuallyAddedQueue") and does the
  // index incrementing.

  // How to delete items from manuallyAddedQueue?
  // Delete item by ID and delete all items previous to an ID.

  /**
   * Removes all items from the queue, which are not included in the new items.
   * This is used to remove tracks which got deleted after a sync update from the queue.
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

  function clear(): void {
    set([])
  }

  /**
   *
   * @param tracks The tracks to add as IQueueItems
   * @param queueIndex The current play index. Used internally to determine which manually added tracks are already played and thus should be removed.
   */
  function setTracks(tracks: readonly ITrack[]): void {
    set(tracks.map(_convertTrackToQueueItem(0)))
  }
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
    isManuallyAdded: true,
  })
}

function _remapIndexes(
  queueItems: readonly IQueueItem[],
  indexToStart = 0
): readonly IQueueItem[] {
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
): readonly IQueueItem[] {
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
): { newQueue: readonly IQueueItem[]; newIndex: number } {
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

export const autoQueueStore = createAutoQueueStore()
