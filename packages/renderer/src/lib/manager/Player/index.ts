import { dequal } from "dequal"
import * as E from "fp-ts/lib/Either"
import { derived, get, writable, type Readable } from "svelte/store"
import { match } from "ts-pattern"
import { pipe } from "fp-ts/lib/function"

import { moveIndexToIndex } from "@sing-shared/Pures"

import { notifiyError, sortAlphabetically } from "@/Helper"

import { audioPlayer } from "./AudioPlayer"
import { loopStateStore } from "./stores/LoopStateStore"
import {
  convertToQueueItem,
  getTracksFromSource,
  initialiseMediaKeysHandler,
  setMediaSessionMetaData,
} from "./Helper"
import { queueStore } from "./stores/QueueStore"

import type {
  IPlayLoop,
  IPlayState,
  IQueueItem,
  IQueueStore,
} from "@/types/Types"
import type { IAlbum, IArtist, ITrack } from "@sing-types/DatabaseTypes"
import type { INewPlayback, IPlayback, ISyncResult } from "@sing-types/Types"
import type { IpcRendererEvent } from "electron"

export const removeIndexFromManualQueue = queueStore.manualQueue.remove
export const addTracksToManualQueueEnd = queueStore.manualQueue.addToEnd
export const addTracksToManualQueueBeginning = queueStore.manualQueue.addToStart

// Create stores / state
const playStateStore = writable<IPlayState>("none")
const volumeStore = writable(1)
const currentTimeStore = writable(0)
const durationStore = writable(0)
const artistsStore = writable<readonly IArtist[]>([])
const albumsStore = writable<readonly IAlbum[]>([])
const tracksStore = writable<readonly ITrack[]>([])
const playbackStore = writable<IPlayback>({
  source: "allTracks",
  sortBy: ["title", "ascending"],
  isShuffleOn: false,
})

// Initialise stores with the music from the database
await initialiseStores()

// Now it makes sense to create and use the derived stores, as the base stores are initialised
export const currentTrack: Readable<ITrack | undefined> = derived(
  queueStore,
  ({ autoQueue, index, manualQueue, isPlayingFromManualQueue }) =>
    isPlayingFromManualQueue ? manualQueue[0].track : autoQueue.at(index)?.track
)

export const shuffleState = derived(
  playbackStore,
  ({ isShuffleOn }) => isShuffleOn
)

// Bind the values of the stores localy.
let $autoQueue: IQueueStore["autoQueue"] = []
let $currentIndex = -1
let $currentTrack: ITrack | undefined
let $manualQueue: IQueueStore["manualQueue"] = []

let $isPlayingFromManualQueue = false
let $isShuffleOn: boolean
let $loopState: IPlayLoop
let $playState: IPlayState = "none"
let $playback: IPlayback

let $volume: number
let seekbarProgressIntervalID: NodeJS.Timer
let volumeBeforeMute: number | undefined

queueStore.subscribe(
  ({ autoQueue, manualQueue, index, isPlayingFromManualQueue }) => {
    $currentIndex = index
    $autoQueue = autoQueue
    $manualQueue = manualQueue
    $isPlayingFromManualQueue = isPlayingFromManualQueue
  }
)

volumeStore.subscribe(($newVolume) => {
  $volume = $newVolume

  audioPlayer.setVolume($newVolume)
})

playStateStore.subscribe(handlePlayStateUpdate)

currentTrack.subscribe(($newCurrentTrack) => {
  if (dequal($currentTrack, $newCurrentTrack)) {
    console.log("Current track stayed same")
    return
  }

  console.log({ $newCurrentTrack })

  $currentTrack = $newCurrentTrack

  setMediaSessionMetaData($newCurrentTrack)

  if ($newCurrentTrack) {
    audioPlayer.setSource($newCurrentTrack.filepath)
  }
})

playbackStore.subscribe(($newPlayback) => {
  $playback = $newPlayback
})

shuffleState.subscribe(($newShuffleState) => {
  $isShuffleOn = $newShuffleState
})

loopStateStore.subscribe(($newLoopState) => {
  $loopState = $newLoopState
})

// Events
window.api.on("syncedMusic", handleSyncUpdate)
audioPlayer.audio.addEventListener("ended", handleClickedNext)

initialiseMediaKeysHandler({
  handleNextTrack: handleClickedNext,
  handlePause: pausePlayback,
  handlePreviousTrack: handleClickedPrevious,
  handlePlay: resumePlayback,
})

// Functions

export function handleClickedNext() {
  console.log($currentIndex, $autoQueue)

  // TODO Make this nicer, but how

  // If the current track is set to loop, loop it
  if ($loopState === "LOOP_TRACK") {
    durationStore.set(0)

    if ($playState === "playing") {
      startPlayingCurrentTrack()
    }

    return
  }

  // If the manuell queue played, remove the played song
  if ($isPlayingFromManualQueue) {
    queueStore.manualQueue.removeFirst()
  }

  $manualQueue.length > 0
    ? queueStore.setIsPlayingFromManualQueue(true)
    : queueStore.setIsPlayingFromManualQueue(false)

  // If there are tracks in the manualQueueStore
  if ($isPlayingFromManualQueue) {
    const source = $manualQueue[0].track.filepath
    if ($playState === "playing") audioPlayer.play(source)

    return
  }

  // If the auto queue reached the end
  if (
    $isPlayingFromManualQueue === false &&
    $currentIndex === $autoQueue.length - 1
  ) {
    // Loop the playback if set

    if ($loopState === "LOOP_QUEUE") {
      queueStore.index.reset()

      if ($playState === "playing") {
        startPlayingCurrentTrack()
      }
      // Start a new playback state
    } else if ($playState === "playing") {
      playRandomTracksPlayback()
    } else {
      goToRandomTracksPlayback()
    }

    return
  }

  // If no manual queue is set, no looping etc. just play the next track in the auto queue.
  if ($playState === "playing") playNext()
  else goToNextTrack()
}

export function handleClickedPrevious() {
  // If the current track is set to loop, loop it
  if ($loopState === "LOOP_TRACK") {
    durationStore.set(0)

    if ($playState === "playing") {
      startPlayingCurrentTrack()
    }

    return
  }

  if ($playState === "playing") playPrevious()
  else goToPreviousTrack()
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
  if ($playState === "playing") {
    pausePlayback()
  } else {
    resumePlayback()
  }
}

export async function toggleShuffle() {
  const newShuffleState = !$isShuffleOn

  pipe(
    await getTracksFromSource({
      ...$playback,
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

        setNewPlayback({
          index,
          tracks,
          playback: { ...$playback, isShuffleOn: newShuffleState },
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
  playStateStore.set("playing")

  audioPlayer.resume()
}

function goToPreviousTrack() {
  queueStore.index.decrement()
}

function playPrevious() {
  // Manually added tracks get removed after play, so there are no previous ones
  if ($isPlayingFromManualQueue) {
    queueStore.setIsPlayingFromManualQueue(false)
  } else {
    queueStore.index.decrement()
  }
  if ($currentTrack === undefined) {
    throw new Error("No current track is defined after playing previous")
  }

  audioPlayer.play($currentTrack.filepath)
}

export function pausePlayback() {
  playStateStore.set("paused")
  audioPlayer.pause()
}

/**
 * Play a track from the queue and update the index according to the track index in the queue.
 */
export function playFromAutoQueue(index: number): void {
  queueStore.set({ isPlayingFromManualQueue: false, index })

  startPlayingCurrentTrack()
}

/**
 * Play a track from the manual queue and if there are any, delete the other manual items before the played track.
 */
export function playFromManualQueue(index: number): void {
  queueStore.update(($state) => {
    $state.isPlayingFromManualQueue = true
    $state.manualQueue = $state.manualQueue.filter(
      (item) => item.index >= index
    )
  })

  startPlayingCurrentTrack()
}

export function removeIndexFromQueue(index: number): void {
  queueStore.autoQueue.removeItems(index)

  // Ensure that the current track stays the same
  if (index < $currentIndex) {
    queueStore.index.decrement()
  }

  // If the current track was removed while it was being played, play the next (the new current) one
  if ($currentIndex === index && $playState === "playing") {
    startPlayingCurrentTrack()
  }
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
  queueStore.setIsPlayingFromManualQueue(false)

  const newShuffleState = data.isShuffleOn ?? $isShuffleOn

  // If the source stayed the same just go to the specified index of the queue.
  if (newShuffleState === false && dequal($playback, data)) {
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

        console.log(
          "🚀 ~ file: index.ts:427 ~ data.isShuffleOn && firstTrack",
          {
            isShuffleOn: newShuffleState,
            firstTrack: firstTrack?.title ?? firstTrack?.filepath,
          }
        )

        const tracksToAdd =
          newShuffleState && firstTrack
            ? [
                firstTrack,
                ...tracks.filter((track) => track.id !== firstTrack.id),
              ]
            : tracks

        setNewPlayback({
          tracks: tracksToAdd,
          index: newShuffleState ? 0 : index,
          playback: newPlaybackState,
        })

        startPlayingCurrentTrack()
      }
    )
  )
}

async function playRandomTracksPlayback() {
  await goToRandomTracksPlayback()

  startPlayingCurrentTrack()
}

/**
 * Sets a new playback with random tracks, but does not start playing.
 */
async function goToRandomTracksPlayback() {
  const playback: IPlayback = {
    source: "allTracks",
    sortBy: ["title", "ascending"],
    isShuffleOn: true,
  }

  pipe(
    await getTracksFromSource(playback),

    E.foldW(
      notifiyError("Error while trying to play selected music"),

      (tracks) => {
        setNewPlayback({
          tracks,
          index: 0,
          playback,
        })
      }
    )
  )
}

/**
 * Sets a new playback. Does not pause or play.
 * Just updates the stores.
 */
function setNewPlayback({
  index,
  tracks,
  playback,
}: {
  index: number
  tracks: readonly ITrack[]
  playback: IPlayback
}): void {
  playbackStore.set(playback)
  queueStore.set({ index, autoQueue: tracks.map(convertToQueueItem) })
}

function playNext() {
  // Update index
  queueStore.index.increment()

  startPlayingCurrentTrack()
}

function goToNextTrack() {
  queueStore.index.increment()

  if ($currentTrack === undefined) {
    throw new Error("Current track is undefined afer going to the next track")
  }
}

function handlePlayStateUpdate(newState: IPlayState) {
  $playState = newState

  navigator.mediaSession.playbackState = newState

  match($playState)
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

// TODO make this use a much slower interval as currently it takes a lot of ressources
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

function startPlayingCurrentTrack() {
  if ($currentTrack === undefined) {
    throw new Error("Current track is undefined and cannot be played")
  }

  playStateStore.set("playing")
  audioPlayer.play($currentTrack.filepath)
}

async function initialiseStores() {
  pipe(
    await window.api.getTracks(),

    E.foldW(
      notifiyError("Failed to get tracks"),

      (newTracks) => {
        if (newTracks.length === 0) return

        tracksStore.set(newTracks)
        queueStore.autoQueue.set(newTracks)
      }
    )
  )

  pipe(
    await window.api.getAlbums(),

    E.foldW(
      notifiyError("Failed to get albums"),

      albumsStore.set
    )
  )

  pipe(
    await window.api.getArtists(),

    E.foldW(
      notifiyError("Failed to get artists"),

      artistsStore.set
    )
  )
}

async function handleSyncUpdate(
  _event: IpcRendererEvent,
  syncResult: ISyncResult
) {
  pipe(
    syncResult,
    E.foldW(
      notifiyError("Failed to update the library. Please restart the app"),

      ({ tracks, albums, artists }) => {
        const sortedTracks = [...tracks].sort(sortAlphabetically)

        if (tracks.length === 0) {
          console.warn("Received tracks at tracksStore -> data is not valid:", {
            tracks,
            albums,
            artists,
          })
        }

        // Update the stores
        tracksStore.set(sortedTracks)
        albumsStore.set(albums)
        artistsStore.set(artists)

        queueStore.intersect(sortedTracks)
      }
    )
  )
}

// Export some stores as read-only to prevent bugs
export const playIndex = derived(queueStore, ($store) => $store.index)
export const playState = { subscribe: playStateStore.subscribe }
export const volume = { subscribe: volumeStore.subscribe }
export const currentTime = { subscribe: currentTimeStore.subscribe }
export const tracks = { subscribe: tracksStore.subscribe }
export const albums = { subscribe: albumsStore.subscribe }
export const artists = { subscribe: artistsStore.subscribe }
export const autoQueue = derived(queueStore, ($store) => $store.autoQueue)
export const playedTracks = derived(
  queueStore,
  // Display only the last 20 played tracks or less if there are no more
  // And if a track from the manualQueue is playing, also display the track at the current index of the autoQueue, as it is not the current track, but the previous to the manualQueue track.
  ({ autoQueue: $autoQueue_, index, isPlayingFromManualQueue }) =>
    $autoQueue_.slice(
      index - 20 > 0 ? index - 20 : 0,
      isPlayingFromManualQueue ? index + 1 : index
    )
)
export const nextTracks: Readable<IQueueItem[]> = derived(
  queueStore,
  ({ autoQueue: $autoQueue_, index: currentIndex }) =>
    $autoQueue_.slice(currentIndex + 1)
)
/**
 * The manual queue for the UI to display.
 * Not to be used for anything else as it adjust some data for rendering.
 */
export const manualQueue = derived(
  queueStore,
  ({ manualQueue: $newManualQueue, isPlayingFromManualQueue }) =>
    // If the current track is from the manual queue, it would still show up in "manually added" section. So lets remove it from the queue for display purposes.
    isPlayingFromManualQueue ? $newManualQueue.slice(1) : $newManualQueue
)

export {
  setNextLoopState,
  loopStateStore as loopState,
} from "./stores/LoopStateStore"
