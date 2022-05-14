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
    deleteIndex: (index: number | number[]) =>
      update(($queue) => {
        return deleteIndex($queue, index)
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
  continueFromIndex: number
): IQueueItem[] {
  return queueItems.map((item, i) => {
    item.index = continueFromIndex + 1 + i
    return item
  })
}

export function deleteIndex(
  queueItems: IQueueItem[],
  indexes: number[] | number
): IQueueItem[] {
  return queueItems.filter(() => {})
}

const queue = createQueueStore()

export default queue
