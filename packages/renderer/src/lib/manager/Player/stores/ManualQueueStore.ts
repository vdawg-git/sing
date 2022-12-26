import { writable } from "svelte/store"
import { dropAt, slice } from "fp-ts-std/ReadonlyArray"
import { flow } from "fp-ts/lib/function"
import { matchW } from "fp-ts/Option"

import type { ITrack } from "@sing-types/DatabaseTypes"

/**
 * The queue which gets filled up automatically.
 * For example, a user plays an album and the queue fills up with tracks from that album.
 */
function createManuellQueueStore() {
  const { subscribe, set, update } = writable<readonly ITrack[]>([])

  return {
    removeIndex,
    removeItemsBeforeIndex,
    clear,
    set,
    subscribe,
    addTracksToEnd,
    addTracksToBeginning,
    removeFirst,
  }

  function clear() {
    set([])
  }

  function removeFirst() {
    removeIndex(0)
  }

  /**
   * Remove a track from the queue based on its index / position within the queue.
   * @param index The index to remove from the queue array. The first track is at 0.
   */
  function removeIndex(index: number): void {
    update(
      flow(
        dropAt(index)(1),
        matchW(
          () => {
            throw new Error(
              `Invalid index to to delete manually added track provided: ${index}`
            )
          },
          (newQueue) => newQueue
        )
      )
    )
  }

  function removeItemsBeforeIndex(index: number): void {
    update(slice(index)(Number.POSITIVE_INFINITY))
  }

  function addTracksToEnd(tracks: readonly ITrack[] | ITrack): void {
    update(($queue) => [
      ...$queue,
      ...(Array.isArray(tracks) ? tracks : [tracks]),
    ])
  }

  function addTracksToBeginning(tracks: readonly ITrack[] | ITrack): void {
    update(($queue) => [
      ...(Array.isArray(tracks) ? tracks : [tracks]),
      ...$queue,
    ])
  }
}

export const manualQueueStore = createManuellQueueStore()
