/* eslint-disable @typescript-eslint/no-explicit-any */
import { readable } from "svelte/store"
import {
  configureStore,
  type AnyAction,
  type ThunkDispatch,
} from "@reduxjs/toolkit"

import { playbackSlice } from "../manager/Player/playbackSlice"

export type IRootState = ReturnType<typeof reduxStore.getState>
export type IAppDispatch = typeof reduxStore.dispatch

// We just use Redux for the playback now as this is the trickiest part.
// Later on more things will get migrated to it

const reduxStore = configureStore({
  reducer: {
    playback: playbackSlice.reducer,
  },
})

const { subscribe } = readable<IRootState>(undefined, (set) => {
  set(reduxStore.getState())

  const unsubscribe = reduxStore.subscribe(() => set(reduxStore.getState()))

  return unsubscribe
})

export const mainStore = {
  subscribe,
}

// Dispatch an action to the main store
const { dispatch } = reduxStore

export const dispatchToRedux = dispatch as ThunkDispatch<
  IRootState,
  any,
  AnyAction
>
