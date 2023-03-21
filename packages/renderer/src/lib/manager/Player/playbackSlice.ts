import { createSlice } from "@reduxjs/toolkit"
import { createDraft } from "immer"
import { match } from "ts-pattern"

import { moveIndexToIndex } from "@sing-shared/Pures"

import { notifiyError } from "@/Helper"

import { playbackReducers } from "./playbackReducers"
import {
  goToRandomTracksPlayback as queueEnded,
  playNewPlayback,
  toggleShuffle,
} from "./playbackThunks"
import { getCurrentTrack } from "./Helper"

import type { IPlayLoop, IPlayState, IQueueItem } from "@/types/Types"
import type {
  IPlaySource,
  ISetPlaybackArgumentWithItems,
} from "@sing-types/Types"

export type IPlaybackState = {
  autoQueue: readonly IQueueItem[]
  manualQueue: readonly IQueueItem[]
  playState: IPlayState
  index: number
  source: IPlaySource | { origin: "NONE" }
  loop: IPlayLoop
  isShuffleOn: boolean
  isPlayingFromManualQueue: boolean
}

const initialState: IPlaybackState = {
  autoQueue: [],
  manualQueue: [],
  playState: "none",
  index: 0,
  source: {
    origin: "allTracks",
  },
  isShuffleOn: false,
  loop: "NONE",
  isPlayingFromManualQueue: false,
}

export const playbackSlice = createSlice({
  name: "playback",
  initialState,

  reducers: {
    setPlayState: playbackReducers.setPlayState,

    setLoop: playbackReducers.setLoop,

    setAutoQueue: playbackReducers.setAutoQueue,

    addPlayLater: playbackReducers.addPlayLater,
    addPlayNext: playbackReducers.addPlayNext,

    intersect: playbackReducers.intersect,

    removeFromManualQueue: playbackReducers.removeFromManualQueue,

    goToNext: playbackReducers.goToNext,

    goToPrevious: playbackReducers.goToPrevious,

    playManualQueueIndex: playbackReducers.playManualQueueIndex,

    playAutoQueueIndex: playbackReducers.playAutoQueueIndex,

    removeFromAutoQueue: playbackReducers.removeFromAutoQueue,

    setNextLoopState: playbackReducers.setNextLoopState,

    _set: playbackReducers._set,

    playTrackFromShuffledQueue: playbackReducers.playTrackFromShuffledQueue,
  },

  extraReducers: (builder) => {
    builder

      .addCase(playNewPlayback.fulfilled, (state, { payload }) => {
        setNewPlaybackState(state, payload)
        state.playState = "playing"
      })

      .addCase(playNewPlayback.rejected, (_, error) => {
        notifiyError("Failed to play new playback")(error)
      })

      .addCase(queueEnded.fulfilled, (state, { payload }) => {
        state.autoQueue = createDraft(payload)
        state.index = 0
        state.source = { origin: "allTracks" }
        state.isShuffleOn = true
        state.isPlayingFromManualQueue = false
        // As this is only used when the queue reached its end, we need to
        // Remove the last track in the manual queue manually if there is one
        state.manualQueue = []
      })

      .addCase(queueEnded.rejected, (_, error) => {
        notifiyError("Failed to set new random playback")(error)
      })

      .addCase(toggleShuffle.fulfilled, (state, { payload }) => {
        state.isShuffleOn = !state.isShuffleOn

        const trackID = getCurrentTrack(state)?.id

        if (!trackID) return

        const { index, newItems: autoQueue } = match(state.isShuffleOn)
          .with(true, () => {
            const indexToMove = payload.findIndex(
              (item) => item.track.id === trackID
            )

            const newItems = moveIndexToIndex({
              index: indexToMove,
              moveTo: 0,
              array: payload,
            })

            if (!newItems)
              throw new Error("Could not move track to the beginning.")

            return {
              index: 0,
              newItems,
            }
          })
          .with(false, () => ({
            index: payload.findIndex(
              (item) => item.track.id === trackID
            ) as number,
            newItems: payload,
          }))
          .exhaustive()

        state.autoQueue = createDraft(autoQueue)
        state.index = index
      })

      .addCase(toggleShuffle.rejected, (_, error) => {
        notifiyError("Failed to toggle shuffle")(error)
      })
  },
})

export const playbackActions = {
  ...playbackSlice.actions,
  playNewPlayback,
  toggleShuffle,
  goToRandomTracksPlayback: queueEnded,
}

function setNewPlaybackState(
  state: IPlaybackState,
  newState: ISetPlaybackArgumentWithItems
) {
  state.autoQueue = newState.items
  state.isShuffleOn = newState.isShuffleOn ?? state.isShuffleOn
  state.index = newState.index
  state.source = newState.source
}
