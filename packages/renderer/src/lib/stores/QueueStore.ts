import { derived, writable } from "svelte/store"
import type { IQueueItem } from "@/types/Types"
import type { ITrack } from "@sing-types/Track"

function createQueueStore() {
  const { subscribe, set, update } = writable<IQueueItem[]>([])

  return { subscribe, reset, set, update, setUpcomingFromSource, setCurrent }

  function reset(index: number): void {
    update(($queue) => $queue.slice(0, index + 1))
  }

  function setUpcomingFromSource(tracks: ITrack[], currentIndex: number) {
    update(($queue) => {
      const played = $queue.slice(0, currentIndex)
      const manuallyAdded = $queue
        .slice(currentIndex)
        .filter((item) => item.isManuallyAdded)

      const newQueueItems: IQueueItem[] = tracks.map((track) => {
        return { isManuallyAdded: false, track, queueID: Symbol() }
      })

      return [...played, ...manuallyAdded, ...newQueueItems]
    })
  }

  function setPlayNext() {}

  function setPlayLater() {}

  function setCurrent(track: ITrack, index: number) {
    update(($queue) => {
      const newQueueItem: IQueueItem = {
        isManuallyAdded: false,
        track,
        queueID: Symbol(track?.title + " " + "queueID"),
      }
      $queue.splice(index, 0, newQueueItem)
      return $queue
    })
  }
}

const queue = createQueueStore()

export default queue
