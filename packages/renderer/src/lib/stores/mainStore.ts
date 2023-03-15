/* eslint-disable @typescript-eslint/no-explicit-any */
import { readable } from "svelte/store"
import { configureStore, type ActionCreatorWithPayload } from "@reduxjs/toolkit"

import { playbackSlice } from "../manager/Player/playbackSlice"

import type { SetReturnType } from "type-fest"

export type RootState = ReturnType<typeof reduxStore.getState>
export type AppDispatch = typeof reduxStore.dispatch

// We just use Redux for the playback now as this is the trickiest part.
// Later on more things will get migrated to it

const reduxStore = configureStore({
  reducer: {
    playback: playbackSlice.reducer,
  },
})

const { subscribe } = readable<RootState>(undefined, (set) => {
  set(reduxStore.getState())

  const unsubscribe = reduxStore.subscribe(() => set(reduxStore.getState()))

  return unsubscribe
})

const dispatchActions = {
  playback: { ...playbackSlice.actions },
} satisfies Record<
  keyof RootState,
  Record<string, ActionCreatorWithPayload<any, string>>
>

/**
 * Dispatches an action to the redux store.
 */
export const dispatch = Object.entries(dispatchActions).reduce(
  (accumulator, [slice, actions]) => {
    accumulator[slice] ??= {}

    for (const action in actions) {
      if (Object.prototype.hasOwnProperty.call(actions, action)) {
        accumulator[slice][action] = (payload: any) =>
          reduxStore.dispatch((actions as any)[action](payload))
      }
    }

    return accumulator
  },
  {} as any
) as unknown as IDispatch

export const mainStore = {
  subscribe,
}

type IDispatch = {
  [Slice in keyof typeof dispatchActions]: {
    [Action in keyof (typeof dispatchActions)[Slice]]: SetReturnType<
      // @ts-expect-error
      (typeof dispatchActions)[Slice][Action],
      void
    >
  }
}
