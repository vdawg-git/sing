import { dequal } from "dequal"
import * as E from "fp-ts/lib/Either"
import { derived, writable, type Readable } from "svelte/store"
import { match } from "ts-pattern"
import { pipe } from "fp-ts/lib/function"

import { moveIndexToIndex } from "@sing-shared/Pures"

import { notifiyError } from "@/Helper"

import { dispatch, mainStore } from "../../stores/mainStore"

import { audioPlayer } from "./AudioPlayer"
import {
  getTracksFromSource,
  goToRandomTracksPlayback,
  handleSyncUpdate,
  initialiseMediaKeysHandler,
  initialiseStores,
  setMediaSessionMetaData,
} from "./Helper"

import type { IPlayLoop, IPlayState, IQueueItem } from "@/types/Types"
import type { IAlbum, IArtist, ITrack } from "@sing-types/DatabaseTypes"
import type { INewPlayback, IPlayMeta } from "@sing-types/Types"

export const removeIDFromManualQueue = dispatch.playback.removeFromManualQueue
export const addTracksToManualQueueEnd = dispatch.playback.addPlayLater
export const addTracksToManualQueueBeginning = dispatch.playback.addPlayNext

// Create stores / state
const volumeStore = writable(1)
const currentTimeStore = writable(0)
const durationStore = writable(0)
const artistsStore = writable<readonly IArtist[]>([])
const albumsStore = writable<readonly IAlbum[]>([])
const tracksStore = writable<readonly ITrack[]>([])

// Initialise stores with the music from the database
await initialiseStores(tracksStore, albumsStore, artistsStore)

// Now it makes sense to create and use the derived stores, as the base stores are initialised
export const currentTrack: Readable<ITrack | undefined> = derived(
  mainStore,
  ({ playback }) =>
    playback.isPlayingFromManualQueue
      ? playback.manualQueue[0].track
      : playback.autoQueue.at(playback.index)?.track
)

export const shuffleState = derived(
  mainStore,
  ({ playback }) => playback.meta.isShuffleOn
)

export const playStateStore = derived(
  mainStore,
  ({ playback }) => playback.playState
)

const loopStore = derived(mainStore, ({ playback }) => playback.loop)
const metaStore = derived(mainStore, ({ playback }) => playback.meta)
const isAtEndStore = derived(mainStore, ({ playback }) => {
  if (playback.loop !== "NONE") return false

  return (
    playback.index === playback.autoQueue.length - 1 &&
    playback.manualQueue.length === 0
  )
})

// Bind the values of the stores localy.
let $currentTrack: ITrack | undefined

let $isShuffleOn: boolean
let $playState: IPlayState = "none"
let $loopState: IPlayLoop
let $meta: IPlayMeta
let $isAtEnd: boolean

let $volume: number
let seekbarProgressIntervalID: NodeJS.Timer
let volumeBeforeMute: number | undefined

volumeStore.subscribe(($newVolume) => {
  $volume = $newVolume

  audioPlayer.setVolume($newVolume)
})

playStateStore.subscribe(handlePlayStateUpdate)
isAtEndStore.subscribe(($newIsAtEnd) => ($isAtEnd = $newIsAtEnd))
loopStore.subscribe(($newLoop) => ($loopState = $newLoop))
metaStore.subscribe(($newMeta) => ($meta = $newMeta))

currentTrack.subscribe(($newCurrentTrack) => {
  if (dequal($currentTrack, $newCurrentTrack)) {
    console.log("Current track stayed same")
    return
  }

  $currentTrack = $newCurrentTrack

  setMediaSessionMetaData($newCurrentTrack)

  if ($newCurrentTrack) {
    audioPlayer.resetCurrentTime()

    if ($playState === "playing") {
      audioPlayer.play($newCurrentTrack.filepath)
    } else {
      audioPlayer.setSource($newCurrentTrack.filepath)
      currentTimeStore.set(0) // Seekbar is not updating when paused
    }
  }
})

shuffleState.subscribe(($newShuffleState) => {
  $isShuffleOn = $newShuffleState
})

// Events
window.api.on(
  "syncedMusic",
  handleSyncUpdate(tracksStore, albumsStore, artistsStore)
)
audioPlayer.audio.addEventListener("ended", handleClickedNext)

initialiseMediaKeysHandler({
  handleNextTrack: handleClickedNext,
  handlePause: pausePlayback,
  handlePreviousTrack: handleClickedPrevious,
  handlePlay: resumePlayback,
})

// Functions

export function handleClickedNext() {
  if ($loopState === "LOOP_TRACK") {
    audioPlayer.resetCurrentTime()
    return
  }
  if ($isAtEnd) {
    goToRandomTracksPlayback()

    return
  }
  dispatch.playback.goToNext()
}

export function handleClickedPrevious() {
  // If the current track is set to loop, loop it
  if ($loopState === "LOOP_TRACK") {
    audioPlayer.resetCurrentTime()
    return
  }
  dispatch.playback.goToPrevious()
}

/**
 * Pauses the audio if it is playing without changing the UI state.
 */
export function handleSeekingStart() {
  if ($playState === "playing") {
    audioPlayer.pauseWithoutFadeOut()
  }
}

/**
 * Used with {@link handleSeekingStart}.
 */
export function handleSeekingEnd() {
  if ($playState === "playing") {
    audioPlayer.resume()
  }
}

/**
 * If the player is playing pause, otherwise resume playback.
 */
export function togglePause() {
  $playState === "playing" ? pausePlayback() : resumePlayback()
}

export async function toggleShuffle() {
  const newShuffleState = !$isShuffleOn

  pipe(
    await getTracksFromSource({
      ...$meta,
      isShuffleOn: newShuffleState,
    }),
    E.foldW(
      notifiyError("Failed to set shuffle. Could not retrieve tracks."),

      async (receivedTracks) => {
        const trackID = $currentTrack?.id

        const { index, tracks }: { index: number; tracks: readonly ITrack[] } =
          match(newShuffleState)
            .with(true, () => {
              const indexToMove = trackID
                ? receivedTracks.findIndex((track) => track.id === trackID)
                : 0 // If there is no current track

              const newTracks = moveIndexToIndex({
                index: indexToMove,
                moveTo: 0,
                array: receivedTracks,
              })

              if (!newTracks)
                throw new Error("Could not move track to the beginning.")

              return {
                index: 0,
                tracks: newTracks,
              }
            })
            .with(false, () => ({
              index: receivedTracks.findIndex(
                (track) => track.id === trackID
              ) as number,
              tracks: receivedTracks,
            }))
            .exhaustive()

        dispatch.playback.setNewPlayback({
          index,
          tracks,
          meta: { ...$meta, isShuffleOn: newShuffleState },
        })
      }
    )
  )
}

export function setVolume(newVolume: number) {
  // For some reason the range input started returning a string onChange.
  volumeStore.set(Number(newVolume))
}

export function seekTo(percentage: number) {
  const newCurrentTime = ($currentTrack?.duration ?? 0) * percentage
  audioPlayer.audio.currentTime = newCurrentTime

  currentTimeStore.set(newCurrentTime)
}

export function resumePlayback() {
  dispatch.playback.setPlayState("playing")

  audioPlayer.resume()
}

export function pausePlayback() {
  dispatch.playback.setPlayState("paused")
  audioPlayer.pause()
}

/**
 * Play a track from the queue and update the index according to the track index in the queue.
 */
export function playFromAutoQueue(index: number): void {
  dispatch.playback.playAutoQueueIndex(index)
}

/**
 * Play a track from the manual queue and if there are any, delete the other manual items before the played track.
 */
export function playFromManualQueue(index: number): void {
  dispatch.playback.playManualQueueIndex(index)
}

/**
 * Remove an item from the auto queue.
 */
export function removeIndexFromQueue(index: number): void {
  dispatch.playback.removeFromAutoQueue(index)
}

export function toggleMute() {
  if ($volume === 0) {
    if (volumeBeforeMute) {
      volumeStore.set(volumeBeforeMute)
      volumeBeforeMute = undefined
    } else {
      volumeStore.set(1)
    }
  } else {
    volumeBeforeMute = $volume
    volumeStore.set(0)
  }
}

/**
 * Starts playback and initializes a new queue
 */
export async function playNewSource({
  firstTrack,
  index,
  ...data
}: INewPlayback) {
  // queueStore.setIsPlayingFromManualQueue(false)

  const newShuffleState = data.isShuffleOn ?? $isShuffleOn

  // If the source stayed the same just go to the specified index of the queue.
  if (newShuffleState === false && dequal($meta, data)) {
    playFromAutoQueue(index)
    return
  }
  const newPlaybackState = {
    ...data,
    isShuffleOn: newShuffleState,
  }

  pipe(
    await getTracksFromSource(newPlaybackState),

    E.foldW(
      notifiyError("Error while trying to play selected music"),

      (tracks) => {
        if (tracks.length === 0) {
          notifiyError("No tracks to play back")("")

          return
        }

        const tracksToAdd =
          newShuffleState && firstTrack
            ? [
                firstTrack,
                ...tracks.filter((track) => track.id !== firstTrack.id),
              ]
            : tracks

        dispatch.playback.playNewPlayback({
          tracks: tracksToAdd,
          index: newShuffleState ? 0 : index,
          meta: newPlaybackState,
        })
      }
    )
  )
}

function handlePlayStateUpdate(newState: IPlayState) {
  $playState = newState

  navigator.mediaSession.playbackState = newState

  match(newState)
    .with("playing", () => {
      durationStore.set($currentTrack?.duration || 0)
      startProgressingSeekbar()
    })
    .with("none", () => {
      endProgressingSeekbar()
      audioPlayer.pause()
      currentTimeStore.set(0)
    })
    .with("paused", endProgressingSeekbar)
    .exhaustive()
}

function startProgressingSeekbar() {
  progressSeekbar()

  seekbarProgressIntervalID = setInterval(progressSeekbar, 400)
}
async function progressSeekbar() {
  const newTime = audioPlayer.getCurrentTime()

  currentTimeStore.set(newTime)
}

function endProgressingSeekbar() {
  clearInterval(seekbarProgressIntervalID)
}

// Export some stores as read-only to prevent bugs
export const playState = { subscribe: playStateStore.subscribe }
export const volume = { subscribe: volumeStore.subscribe }
export const currentTime = { subscribe: currentTimeStore.subscribe }
export const tracks = { subscribe: tracksStore.subscribe }
export const albums = { subscribe: albumsStore.subscribe }
export const artists = { subscribe: artistsStore.subscribe }
// Display only the last 20 played tracks or less if there
export const playIndex = derived(mainStore, ({ playback }) => playback.index)
export const playedTracks = derived(
  mainStore,
  // Display only the last 20 played tracks or less if there are no more
  // And if a track from the manualQueue is playing, also display the track at the current index of the autoQueue, as it is not the current track, but the previous to the manualQueue track.
  ({ playback }) =>
    playback.autoQueue.slice(
      playback.index - 20 > 0 ? playback.index - 20 : 0,
      playback.isPlayingFromManualQueue ? playback.index + 1 : playback.index
    )
)
export const nextTracks: Readable<IQueueItem[]> = derived(
  mainStore,
  ({ playback }) => playback.autoQueue.slice(playback.index + 1)
)
/**
 * The manual queue for the UI to display.
 * Not to be used for anything else as it adjust some data for rendering.
 */
export const manualQueue = derived(mainStore, ({ playback }) =>
  // If the current track is from the manual queue, it would still show up in "manually added" section. So lets remove it from the queue for display purposes.
  playback.isPlayingFromManualQueue
    ? playback.manualQueue.slice(1)
    : playback.manualQueue
)

export const loopState = derived(mainStore, ({ playback }) => playback.loop)
export const setNextLoopState = dispatch.playback.setNextLoopState
