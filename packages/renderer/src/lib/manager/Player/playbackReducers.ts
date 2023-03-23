import { pipe } from "fp-ts/lib/function"
import * as O from "fp-ts/lib/Option"
import { createDraft } from "immer"

import { moveIndexToIndex, removeFromArray } from "@sing-shared/Pures"

import { convertToQueueItem } from "./Helper"

import type { PayloadAction } from "@reduxjs/toolkit"
import type { IPlayLoop } from "@/types/Types"
import type { ITrack } from "@sing-types/DatabaseTypes"
import type { WritableDraft } from "immer/dist/internal"
import type { RequireAtLeastOne } from "type-fest"
import type { IPlaybackState } from "./playbackSlice"
import type { ITrackID } from "@sing-types/Opaque"
import type { IQueueItem, IQueueItemID } from "@sing-types/Types"

// Export like that to prevent polluting IntelliSense imports
export const playbackReducers = {
  _intersectWithItems,
  _set,
  addPlayLater,
  addPlayNext,
  convertTracksForManualQueueAdding,
  goToNext,
  goToPrevious,
  intersect,
  playAutoQueueIndex,
  playManualQueueIndex,
  removeFromAutoQueue,
  removeFromManualQueue,
  setAutoQueue,
  setLoop,
  setNextLoopState,
  setPlayState,
  playTrackFromShuffledQueue,
}

function _set(
  state: WritableDraft<IPlaybackState>,
  { payload }: PayloadAction<RequireAtLeastOne<IPlaybackState>>
) {
  state.playState = payload.playState ?? state.playState
  state.autoQueue = (payload.autoQueue as IQueueItem[]) ?? state.autoQueue
  state.manualQueue = (payload.manualQueue as IQueueItem[]) ?? state.manualQueue
  state.index = payload.index ?? state.index
  state.loop = payload.loop ?? state.loop
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state.source = (payload.source as any) ?? state.source
  state.isPlayingFromManualQueue =
    payload.isPlayingFromManualQueue ?? state.isPlayingFromManualQueue
}

/**
 * Play a track from the auto queue while it is shuffled.
 */
function playTrackFromShuffledQueue(
  state: WritableDraft<IPlaybackState>,
  { payload: trackID }: PayloadAction<ITrackID>
) {
  const index = state.autoQueue.findIndex((item) => item.track.id === trackID)

  const newQueue = moveIndexToIndex({
    index,
    moveTo: 0,
    array: state.autoQueue,
  })

  if (!newQueue) {
    throw new Error(
      `Failed to move played track to the beginning of the queue. Probably the index is out of bounds.\ntrack:${state.autoQueue[index]}`
    )
  }
  state.autoQueue = createDraft(newQueue)
  state.playState = "playing"
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setNextLoopState(state: WritableDraft<IPlaybackState>) {
  const loopStates: IPlayLoop[] = ["NONE", "LOOP_QUEUE", "LOOP_TRACK"]

  if (state.loop === "LOOP_TRACK") {
    state.loop = "NONE"
    return
  }

  state.loop = loopStates[loopStates.indexOf(state.loop) + 1]
}

function setPlayState(
  state: WritableDraft<IPlaybackState>,
  action: PayloadAction<MediaSessionPlaybackState>
) {
  state.playState = action.payload
}

function setLoop(
  state: WritableDraft<IPlaybackState>,
  action: PayloadAction<IPlayLoop>
) {
  state.loop = action.payload
}

function setAutoQueue(
  state: WritableDraft<IPlaybackState>,
  action: PayloadAction<readonly ITrack[]>
) {
  state.autoQueue = action.payload.map(convertToQueueItem)
}

function addPlayLater(
  state: WritableDraft<IPlaybackState>,
  action: PayloadAction<ITrack | readonly ITrack[]>
) {
  state.manualQueue.push(
    ...convertTracksForManualQueueAdding(state.manualQueue, action.payload)
  )
}

function addPlayNext(
  state: WritableDraft<IPlaybackState>,
  action: PayloadAction<ITrack | readonly ITrack[]>
) {
  state.manualQueue.unshift(
    ...convertTracksForManualQueueAdding(state.manualQueue, action.payload)
  )
}

/**
 * Create an intersection of the current queue (including auto queue) with new tracks.
 *
 * In other words, remove all tracks which are not in the `payload`
 * and adjust the current index accordingly.
 */
function intersect(
  state: WritableDraft<IPlaybackState>,
  action: PayloadAction<readonly ITrack[]>
) {
  const { newIndex, newAutoQueue, newManualQueue } = _intersectWithItems({
    newTracks: action.payload,
    autoQueue: state.autoQueue,
    manualQueue: state.manualQueue,
    currentIndex: state.index,
  })

  state.autoQueue = newAutoQueue as IQueueItem[]
  state.manualQueue = newManualQueue as IQueueItem[]
  state.playState = state.index === newIndex ? state.playState : "paused"
  state.index = newIndex
  // The queue is now most likely out of sync with the current source
  state.source = { origin: "NONE" }

  if (newAutoQueue.length === 0 && newManualQueue.length === 0)
    state.playState = "none"
}

function removeFromManualQueue(
  state: WritableDraft<IPlaybackState>,
  { payload: id }: PayloadAction<IQueueItemID>
) {
  state.manualQueue = state.manualQueue.filter((item) => item.queueID !== id)
}

function goToNext(state: WritableDraft<IPlaybackState>) {
  if (state.loop === "LOOP_TRACK") return state

  if (state.isPlayingFromManualQueue) {
    state.manualQueue.shift()

    state.isPlayingFromManualQueue = state.manualQueue.length > 0
    state.index = state.manualQueue.length > 0 ? state.index : state.index + 1

    return
  }

  if (state.manualQueue.length > 0) {
    state.isPlayingFromManualQueue = true

    return
  }

  // If the auto queue reached the end
  if (
    state.loop === "LOOP_QUEUE" &&
    state.isPlayingFromManualQueue === false &&
    state.index === state.autoQueue.length - 1
  ) {
    state.index = 0
    return
  }

  // Otherwise, go to the next track
  state.index++
}

function goToPrevious(state: WritableDraft<IPlaybackState>) {
  if (state.loop === "LOOP_TRACK") return state

  if (state.isPlayingFromManualQueue) {
    state.isPlayingFromManualQueue = false
    return
  }

  state.index -= 1
}

function playManualQueueIndex(
  state: WritableDraft<IPlaybackState>,
  { payload }: PayloadAction<number>
) {
  state.manualQueue = state.manualQueue.filter((item) => item.index >= payload)
  state.playState = "playing"
}

function playAutoQueueIndex(
  state: WritableDraft<IPlaybackState>,
  { payload }: PayloadAction<number>
) {
  state.index = payload
  state.isPlayingFromManualQueue = false
  state.playState = "playing"
}

function removeFromAutoQueue(
  state: WritableDraft<IPlaybackState>,
  { payload }: PayloadAction<number>
) {
  state.autoQueue = pipe(
    state.autoQueue,
    removeFromArray(payload),
    O.fromNullable,
    O.getOrElseW(() => {
      throw new Error("Provided index is out of bounds")
    }),
    // Update indexes
    (items) => items.map((item, index_) => ({ ...item, index: index_ }))
  )

  // Ensure that the current track stays the same
  if (payload < state.index) {
    state.index--
  }
}
/**
 * The logic behind {@link intersect}.
 *
 * Returns the new queues and index.
 */
function _intersectWithItems({
  currentIndex,
  autoQueue,
  manualQueue,
  newTracks,
}: {
  autoQueue: readonly IQueueItem[]
  manualQueue: readonly IQueueItem[]
  newTracks: readonly ITrack[]
  currentIndex: number
}) {
  const newTrackIDs = new Set(newTracks.map((track) => track.id))

  const newAutoQueue = autoQueue.filter(isIntersectingTrack)
  const newManualQueue = manualQueue.filter(isIntersectingTrack)

  // If tracks before the current one are deleted, the index needs to be adjusted
  // so that it still points to the current track
  const reduceIndexBy = autoQueue
    .filter((_, index) => index <= currentIndex)
    .filter((track) => !isIntersectingTrack(track)).length
  // +(deletedIndexes.includes(currentIndex) ? 1 : 0)

  const newIndex = Math.max(currentIndex - reduceIndexBy, 0)

  return { newIndex, newAutoQueue, newManualQueue }

  function isIntersectingTrack(item: IQueueItem) {
    if (newTrackIDs.has(item.track.id)) return true

    return false
  }
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
