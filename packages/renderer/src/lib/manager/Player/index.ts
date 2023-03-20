import { dequal } from "dequal"
import { derived, writable, type Readable } from "svelte/store"
import { match } from "ts-pattern"

import { dispatchToRedux, mainStore } from "../../stores/mainStore"

import { audioPlayer } from "./AudioPlayer"
import {
  getCurrentTrack,
  handleSyncUpdate,
  initialiseMediaKeysHandler,
  initialiseStores,
  setMediaSessionMetaData,
} from "./Helper"
import { playbackActions } from "./playbackSlice"

import type { IPlayLoop, IPlayState, IQueueItem } from "@/types/Types"
import type { IAlbum, IArtist, ITrack } from "@sing-types/DatabaseTypes"
import type { ICurrentPlayback } from "@sing-types/Types"

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
  ({ playback }) => getCurrentTrack(playback)
)

export const currentPlayback: Readable<ICurrentPlayback> = derived(
  mainStore,
  ({ playback }) => ({
    ...playback.source,
    index: playback.index,
  })
)

export const isShuffleOn = derived(
  mainStore,
  ({ playback }) => playback.isShuffleOn
)

export const playStateStore = derived(
  mainStore,
  ({ playback }) => playback.playState
)

export const loopState = derived(mainStore, ({ playback }) => playback.loop)
const isAtEndStore = derived(mainStore, ({ playback }) => {
  if (playback.loop !== "NONE") return false

  return (
    playback.index === playback.autoQueue.length - 1 &&
    (playback.manualQueue.length === 0 ||
      (playback.manualQueue.length === 1 &&
        playback.isPlayingFromManualQueue === true))
  )
})

let $currentTrack: ITrack | undefined

let $playState: IPlayState = "none"
let $loopState: IPlayLoop
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
loopState.subscribe(($newLoop) => ($loopState = $newLoop))

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
    dispatchToRedux(playbackActions.goToRandomTracksPlayback())
    return
  }

  dispatchToRedux(playbackActions.goToNext())
}

export function handleClickedPrevious() {
  // If the current track is set to loop, loop it
  if ($loopState === "LOOP_TRACK") {
    audioPlayer.resetCurrentTime()
    return
  }
  dispatchToRedux(playbackActions.goToPrevious())
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
  dispatchToRedux(playbackActions.setPlayState("playing"))

  audioPlayer.resume()
}

export function pausePlayback() {
  dispatchToRedux(playbackActions.setPlayState("paused"))
  audioPlayer.pause()
}

/**
 * Play a track from the manual queue and if there are any, delete the other manual items before the played track.
 */
export function playFromManualQueue(index: number): void {
  dispatchToRedux(playbackActions.playManualQueueIndex(index))
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
  // If the current track is from the manual queue, it would still show up in the "manually added" section. So lets remove it from the queue for display purposes.
  playback.isPlayingFromManualQueue
    ? playback.manualQueue.slice(1)
    : playback.manualQueue
)

export const setNextLoopState = dispatchToRedux(
  playbackActions.setNextLoopState
)
