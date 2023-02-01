import { writable } from "svelte/store"
import { produce } from "immer"
import { pipe } from "fp-ts/lib/function"
import * as O from "fp-ts/lib/Option"

import { removeFromArray } from "@sing-shared/Pures"

import { convertToQueueItem } from "../Helper"

import type { Draft } from "immer"
import type { ITrack } from "@sing-types/DatabaseTypes"
import type { RequireAtLeastOne } from "type-fest"
import type { IQueueItem, IQueueStore } from "@/types/Types"

// Learning how to use slices would be good here

const { update: updateBase, subscribe } = writable<IQueueStore>({
  autoQueue: [],
  manualQueue: [],
  index: 0,
  isPlayingFromManualQueue: false,
})

export const queueStore = {
  subscribe,
  update,
  set,
  index: {
    set: setIndex,
    increment: incrementIndex,
    decrement: decrementIndex,
    reset: resetIndex,
  },
  autoQueue: {
    set: setAutoQueue,
    update: updateAutoQueue,
    removeItem: removeAutoQueueTracks,
  },
  manualQueue: {
    set: setManualQueue,
    removeFirst: removeFirstFromManualQueue,
    addToStart: addTracksToBeginningManualQueue,
    addToEnd: addTracksToEndManualQueue,
    remove: removeIDManualQueue,
  },
  setIsPlayingFromManualQueue,
  intersect,
}

/**
 * Use Immers produce funtion for the update
 */
function update(producer: (draft: Draft<IQueueStore>) => void) {
  return updateBase(produce(producer))
}

// Make all keys but one optional, use TypeFest for that
function set(data: RequireAtLeastOne<IQueueStore>) {
  update(($store) => {
    if (data.autoQueue !== undefined) {
      $store.autoQueue = data.autoQueue as IQueueItem[]
    }
    if (data.manualQueue !== undefined) {
      $store.manualQueue = data.manualQueue as IQueueItem[]
    }
    if (data.index !== undefined) {
      $store.index = data.index
    }
  })
}

function setAutoQueue(queue: readonly ITrack[]) {
  update((draft) => {
    draft.autoQueue = queue.map(convertToQueueItem)
  })
}

function updateAutoQueue(producer: (queue: Draft<ITrack[]>) => void) {
  update((draft) => {
    draft.autoQueue = produce(draft.autoQueue, producer)
  })
}

function setIndex(index: number) {
  update((draft) => {
    draft.index = index
  })
}

function incrementIndex() {
  update((draft) => {
    draft.index += 1
  })
}

function decrementIndex() {
  update((draft) => {
    draft.index =
      draft.index === 0 ? draft.autoQueue.length - 1 : draft.index - 1
  })
}

function setIsPlayingFromManualQueue(value: boolean) {
  update(($store) => {
    $store.isPlayingFromManualQueue = value
  })
}

/**
 * Create an intersection of the current queue (including auto queue) with new tracks.
 *
 * In other words, remove all tracks which are not in the `newTracks array`
 * and adjust the current index accordingly.
 */
function intersect(newTracks: readonly ITrack[]): void {
  update(($store) => {
    const { newIndex, newAutoQueue, newManualQueue } = _intersectWithItems({
      newTracks,
      autoQueue: $store.autoQueue,
      manualQueue: $store.manualQueue,
      currentIndex: $store.index,
    })

    $store.autoQueue = newAutoQueue as IQueueItem[]
    $store.manualQueue = newManualQueue as IQueueItem[]
    $store.index = newIndex
  })
}

function removeAutoQueueTracks(index: number | readonly number[]) {
  update(($state) => {
    $state.autoQueue = pipe(
      $state.autoQueue,
      removeFromArray(index),
      O.fromNullable,
      O.getOrElseW(() => {
        throw new Error("Provided index is out of bounds")
      }),
      (items) => items.map((item, index_) => ({ ...item, index: index_ }))
    )

    // Ensure that the current track stays the same
    if (index < $state.index) {
      $state.index--
    }
  })
}

/**
 * The logic behind {@link intersect}.
 */
function _intersectWithItems({
  currentIndex,
  autoQueue,
  manualQueue,
  newTracks,
}: {
  autoQueue: IQueueStore["autoQueue"]
  manualQueue: IQueueStore["manualQueue"]
  newTracks: readonly ITrack[]
  currentIndex: number
}) {
  const newTrackIDs = new Set(newTracks.map((track) => track.id))

  const deletedIndexes: number[] = []

  const newAutoQueue = autoQueue
    .map(({ track }) => track)
    .filter(removeNotIntersectingTracks)
    .map(convertToQueueItem)
  const newManualQueue = manualQueue
    .map((item) => item.track)
    .filter(removeNotIntersectingTracks)
    .map(convertToQueueItem)

  // If tracks before the current one are deleted, the index needs to be adjusted
  // so that it still points to the current track
  const reduceIndexBy =
    deletedIndexes.filter((index) => index <= currentIndex).length +
    (deletedIndexes.includes(currentIndex) ? 1 : 0)

  const newIndex =
    currentIndex - reduceIndexBy < -1 ? -1 : currentIndex - reduceIndexBy

  return { newIndex, newAutoQueue, newManualQueue }

  function removeNotIntersectingTracks(track: ITrack, index: number) {
    if (newTrackIDs.has(track.id)) return true

    deletedIndexes.push(index)
    return false
  }
}

function resetIndex() {
  update(($store) => {
    $store.index = 0
  })
}

function setManualQueue(tracks: readonly ITrack[]) {
  update(($store) => {
    $store.manualQueue = tracks.map(convertToQueueItem)
  })
}

function removeFirstFromManualQueue() {
  update(($store) => {
    $store.manualQueue.shift()
  })
}

/**
 * Remove a track from the queue based on its index / position within the queue.
 * @param index The index to remove from the queue array. The first track is at 0.
 */
function removeIDManualQueue(id: symbol): void {
  update(($store) => {
    $store.manualQueue = $store.manualQueue.filter(
      (item) => item.queueID !== id
    )
  })
}

function addTracksToEndManualQueue(tracks: readonly ITrack[] | ITrack): void {
  update(($store) => {
    $store.manualQueue.push(
      ...convertTracksForManualQueueAdding($store.manualQueue, tracks)
    )
  })
}

function addTracksToBeginningManualQueue(
  tracks: readonly ITrack[] | ITrack
): void {
  update(($store) => {
    $store.manualQueue.unshift(
      ...convertTracksForManualQueueAdding($store.manualQueue, tracks)
    )
  })
}

function convertTracksForManualQueueAdding(
  currentQueue: readonly IQueueItem[],
  tracks: readonly ITrack[] | ITrack
): readonly IQueueItem[] {
  const lastIndex = currentQueue.at(-1)?.index
  const startingIndex = lastIndex === undefined ? 0 : lastIndex + 1

  return Array.isArray(tracks)
    ? tracks.map((track, index) =>
        convertToQueueItem(track, index + startingIndex)
      )
    : [convertToQueueItem(tracks, startingIndex)]
}
