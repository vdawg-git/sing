import { derived, writable } from "svelte/store"
import type { IQueueItem } from "../../types/Types"
import type { Track as ITrack } from "@prisma/client"

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

      const newQueueItems: IQueueItem[] = tracks.map((track, index) => {
        return { isManuallyAdded: false, track, index: index + $queue.length }
      })

      return [...played, ...manuallyAdded, ...newQueueItems]
    })
  }

  function setPlayNext() {}

  function setPlayLater() {}

  function setCurrent(track: ITrack, index: number) {
    update(($queue) => {
      const newQueueItem = {
        isManuallyAdded: false,
        track,
        index,
      }
      $queue.splice(index, 0, newQueueItem)
      return $queue
    })
  }
}

const queue = createQueueStore()

export default queue
