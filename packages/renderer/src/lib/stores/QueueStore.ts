import { derived, writable } from "svelte/store"
import type { IQueueItem } from "@/types/Types"
import type { ITrack } from "@sing-types/Track"

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
      update(($queue) => {
        return removeIndex($queue, index)
      }),
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
        queueID: Symbol(track?.title + " " + "queueID"),
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
  return tracks.map((track, i) => {
    return {
      index: continueFromIndex + i,
      queueID: Symbol(track?.title + " " + "queueID"),
      track,
      isManuallyAdded: false,
    }
  })
}

export function remapIndexes(
  queueItems: IQueueItem[],
  indexToStart: number = 0
): IQueueItem[] {
  return queueItems.slice(0).map((item, i) => {
    const newIndex = indexToStart + i

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

  function remove(queueItems: IQueueItem[], indexes: number | number[]) {
    if (typeof indexes === "number") {
      const result = queueItems.slice(0)
      result.splice(indexes, 1)
      return result
    }

    return queueItems.filter((_, i) => !indexes.includes(i))
  }
}

const queue = createQueueStore()

export default queue
