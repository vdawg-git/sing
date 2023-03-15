import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { pipe } from "fp-ts/lib/function"
import * as O from "fp-ts/lib/Option"

import { removeFromArray } from "@sing-shared/Pures"

import { convertToQueueItem } from "./Helper"

import type { IPlayLoop, IPlayState, IQueueID, IQueueItem } from "@/types/Types"
import type { IPlayMeta } from "@sing-types/Types"
import type { ITrack } from "@sing-types/DatabaseTypes"
import type { WritableDraft } from "immer/dist/internal"

export type IPlaybackState = {
  autoQueue: readonly IQueueItem[]
  manualQueue: readonly IQueueItem[]
  playState: IPlayState
  index: number
  meta: IPlayMeta
  loop: IPlayLoop
  isPlayingFromManualQueue: boolean
}

const initialState: IPlaybackState = {
  autoQueue: [],
  manualQueue: [],
  playState: "none",
  index: 0,
  meta: {
    source: "allTracks",
    sortBy: ["title", "ascending"],
    isShuffleOn: false,
  },
  loop: "NONE",
  isPlayingFromManualQueue: false,
}

export const playbackSlice = createSlice({
  name: "playback",
  initialState,

  reducers: {
    setPlayState,

    setLoop,

    setAutoQueue,

    addPlayLater,
    addPlayNext,

    intersect,

    removeFromManualQueue,

    goToNext,

    goToPrevious,

    playManualQueueIndex,

    playAutoQueueIndex,

    removeFromAutoQueue,

    setNewPlayback,

    playNewPlayback,

    setNextLoopState,
  },
})

type INewPlaybackPayload = PayloadAction<{
  meta: IPlayMeta
  tracks: readonly ITrack[]
  index?: number
}>

function playNewPlayback(
  state: WritableDraft<IPlaybackState>,
  action: INewPlaybackPayload
) {
  setNewPlayback(state, action)

  state.playState = "playing"
}

function setNewPlayback(
  state: WritableDraft<IPlaybackState>,
  { payload }: INewPlaybackPayload
) {
  state.meta = payload.meta as WritableDraft<IPlayMeta>
  state.autoQueue = payload.tracks.map(convertToQueueItem)
  state.index = payload.index ?? 0
  state.isPlayingFromManualQueue = false
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
  state.index = newIndex
}

function removeFromManualQueue(
  state: WritableDraft<IPlaybackState>,
  { payload: id }: PayloadAction<IQueueID>
) {
  state.manualQueue = state.manualQueue.filter((item) => item.queueID !== id)
}

function goToNext(state: WritableDraft<IPlaybackState>) {
  if (state.loop === "LOOP_TRACK") return state

  if (state.isPlayingFromManualQueue) {
    state.manualQueue.shift()

    state.isPlayingFromManualQueue = state.manualQueue.length > 0

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
