import { writable } from "svelte/store"

import type { IQueueItem } from "@/types/Types"
import type { ITrack } from "@sing-types/Types"

function createQueueStore() {
  const { subscribe, set, update } = writable<IQueueItem[]>([])

  return {
    subscribe,
    reset,
    set,
    update,
    setUpcomingFromSource,
    setCurrent,
    removeIndex: (index: number | number[]) =>
      update(($queue) => removeIndex($queue, index)),
  }

  function reset(index: number): void {
    update(($queue) => $queue.slice(0, index + 1))
  }

  function setUpcomingFromSource(tracks: ITrack[], queueIndex: number): void {
    update(($queue) => {
      const played = $queue.slice(0, queueIndex)
      const manuallyAdded = $queue
        .slice(queueIndex)
        .filter((item) => item.isManuallyAdded)

      const newQueueItems: IQueueItem[] = mapTracksToQueueItem(
        tracks,
        queueIndex
      )

      return [...played, ...manuallyAdded, ...newQueueItems]
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

export function mapTracksToQueueItem(
  tracks: ITrack[],
  continueFromIndex: number
): IQueueItem[] {
  return tracks.map((track, index) => ({
    index: continueFromIndex + index,
    queueID: Symbol(`${track?.title} queueID`),
    track,
    isManuallyAdded: false,
  }))
}

export function remapIndexes(
  queueItems: IQueueItem[],
  indexToStart = 0
): IQueueItem[] {
  return [...queueItems].map((item, index) => {
    const newIndex = indexToStart + index

    const clonedItem = {
      ...item,
      index: newIndex,
      queueID: Symbol(`${newIndex} ${item.track?.title || "Unknown"}`),
    }
    return clonedItem
  })
}

export function removeIndex(
  queueItems: IQueueItem[],
  indexes: number[] | number
): IQueueItem[] {
  const cleaned = remove(queueItems, indexes)

  return remapIndexes(cleaned)
}

function remove(queueItems: IQueueItem[], indexes: number | number[]) {
  if (typeof indexes === "number") {
    const result = [...queueItems]
    result.splice(indexes, 1)
    return result
  }

  return queueItems.filter((_, index) => !indexes.includes(index))
}

const queue = createQueueStore()

export default queue
