import { doOrNotifyWithData, moveElementFromToIndex, sortAlphabetically } from "@/Helper"
import audioPlayer from "@/lib/manager/player/AudioPlayer"
import { dequal } from "dequal"
import * as E from "fp-ts/lib/Either"
import { derived, get, writable } from "svelte/store"
import { match } from "ts-pattern"

import indexStore from "./stores/PlayIndex"
import queueStore from "./stores/QueueStore"

import type { Either } from "fp-ts/lib/Either"
import type { IPlayLoop, IPlayState, IQueueItem } from "@/types/Types"
import type {
  ITrack,
  ISyncResult,
  IAlbum,
  IArtist,
  IError,
  INewPlayback,
  IPlayback,
  ISortOptions,
} from "@sing-types/Types"
import type { IpcRendererEvent } from "electron"

// TODO Add genre to the db, too

// Create stores / state
const playStateStore = writable<IPlayState>("STOPPED")
const volumeStore = writable(1)
const currentTimeStore = writable(0)
const durationStore = writable(0)
const tracksStore = writable<readonly ITrack[]>([])
const albumsStore = writable<readonly IAlbum[]>([])
const artistsStore = writable<readonly IArtist[]>([])
const playbackStore = writable<IPlayback>({
  source: "tracks",
  sortBy: ["title", "ascending"],
  isShuffleOn: false,
})
const playLoopStore = writable<IPlayLoop>("NONE")

// Initialise stores with the music from the database
await initialiseStores()

// Now it makes sense to create and use the derived stores, as the base stores are initialised
export const currentTrack = derived(
  [queueStore, indexStore],
  ([$queue, $index]) => $queue[$index]
)
export const playedTracks = derived(
  [queueStore, indexStore],
  ([$queue, $index]) => $queue.slice($index - 20 > 0 ? $index - 20 : 0, $index) // Display only the last 20 played tracks or less if there are no more
)
export const nextTracks = derived(
  [queueStore, indexStore],
  ([$queue, $index]) => $queue.slice($index + 1)
)

export const shuffleState = derived(
  playbackStore,
  ({ isShuffleOn }) => isShuffleOn
)

// Bind the values of the stores localy.
let $playState: IPlayState = "STOPPED"
let $queue: IQueueItem[] = []
let $currentIndex = -1
let $currentTrack: IQueueItem
let $playback: IPlayback
let seekAnimationID: number
let $isShuffleOn: boolean
let $playLoop: IPlayLoop

// How to do "set shuffle" and then "unset shuffle" ?

/**
 * Stores the state before the user hit `shuffle`, so that when the user disables shuffling again, it can revert back to normal.
 */
// let beforeShuffle: { sort: ISortOptions["tracks"]; index: number } | undefined

queueStore.subscribe(($newQueue) => {
  $queue = $newQueue
})

indexStore.subscribe(($newIndex) => {
  $currentIndex = $newIndex
  resetCurrentTime()
})

playStateStore.subscribe(handlePlayStateUpdate)

currentTrack.subscribe(($newCurrentTrack) => {
  $currentTrack = $newCurrentTrack
})

playbackStore.subscribe(($newPlayback) => {
  $playback = $newPlayback
})

/**
 * Shuffle or unshuffle the current queue when the shuffle state changes
 */
shuffleState.subscribe(async ($newShuffleState) => {
  $isShuffleOn = $newShuffleState
})

playLoopStore.subscribe(($newPlayLoop) => {
  $playLoop = $newPlayLoop
})

// Events
window.api.listen("syncedMusic", handleSyncUpdate)
audioPlayer.audio.addEventListener("ended", handlePlayNext)
audioPlayer.audio.addEventListener("volumechange", onVolumeChange)

export function handlePlayNext() {
  // I want to find a way to make this nicer

  // If the current track is set to loop, loop it
  if ($playLoop === "LOOP_TRACK") {
    durationStore.set(0)

    if ($playState === "PLAYING") {
      startPlayingCurrentTrack()
    }

    return
  }

  // If the queue reached its end
  if ($currentIndex === $queue.length - 1) {
    if ($playLoop === "LOOP_QUEUE") {
      indexStore.reset()

      if ($playState === "PLAYING") {
        startPlayingCurrentTrack()
      }
    } else if ($playState === "PLAYING") {
      playRandomTracksPlayback()
    } else {
      goToRandomTracksPlayback()
    }

    return
  }

  // If it did not reach its end and it is not looping. simply go to the next track
  if ($playState === "PLAYING") {
    playNext()
  } else {
    goToNextTrack()
  }
}

export function handleClickedPrevious() {
  playPrevious()
}

export async function toggleShuffle() {
  playbackStore.update(({ isShuffleOn, ...rest }) => ({
    ...rest,
    isShuffleOn: !isShuffleOn,
  }))

  // Set the new queue
  doOrNotifyWithData(
    "Failed to set shuffle. Could not retrieve tracks.",
    async (tracks) => {
      const trackID = $currentTrack.track.id

      const indexAndTracks: { index: number; tracks: readonly ITrack[] } =
        match($isShuffleOn)
          .with(true, () => {
            const indexToMove = tracks.findIndex(
              (track) => track.id === trackID
            ) as number

            return {
              index: 0,
              tracks: moveElementFromToIndex(
                indexToMove,
                0,
                tracks
              ) as ITrack[],
            }
          })
          .with(false, () => ({
            index: tracks.findIndex((track) => track.id === trackID) as number,
            tracks,
          }))
          .exhaustive()

      setNewPlayback({
        ...indexAndTracks,
        playback: { ...$playback, isShuffleOn: $isShuffleOn },
      })
    },
    getTracksFromSource({
      ...$playback,
      isShuffleOn: $isShuffleOn,
    })
  )
}

export function setVolume(newVolume: number) {
  audioPlayer.setVolume(newVolume)
}

export function seekTo(percentage: number) {
  const newCurrentTime = ($currentTrack.track.duration || 0) * percentage
  audioPlayer.audio.currentTime = newCurrentTime

  currentTimeStore.set(newCurrentTime)
}

export function resumePlayback() {
  playStateStore.set("PLAYING")

  audioPlayer.resume()
}

function playPrevious() {
  indexStore.update((index) => {
    if (index <= 0) return $queue.length - 1
    return index - 1
  })

  if ($playState === "STOPPED" || $playState === "PAUSED")
    audioPlayer.setSource($currentTrack.track.filepath)
  else {
    audioPlayer.play($currentTrack.track.filepath)
  }
}

export function pausePlayback() {
  playStateStore.set("PAUSED")
  audioPlayer.pause()
}

export function setMuted(muted: boolean) {
  audioPlayer.setMuted(muted)
}

export function isMuted() {
  return audioPlayer.isMuted()
}

/**
 * Play a track from the queue and update the index according to the track index in the queue.
 */
export function playFromQueue(index: number): void {
  indexStore.set(index)

  startPlayingCurrentTrack()
}

export function removeIndexFromQueue(index: number): void {
  queueStore.removeIndex(index)

  if (index < $currentIndex) {
    indexStore.decrement() // So that the current track stays the same
  }

  if ($currentIndex === index && $playState === "PLAYING") {
    startPlayingCurrentTrack()
  }
}

/**
 * Play a track and set the queue to all tracks shuffled.
 * @param trackToPlay The track to be played.
 */
export async function playTrackAsShuffledTracks(trackToPlay: ITrack) {
  // Immediately start playing the provided track without waiting for the rest of the tracks from the source
  indexStore.reset()
  queueStore.setTracks([trackToPlay], 0)

  startPlayingCurrentTrack()

  // Now fill the queue
  doOrNotifyWithData(
    "Could not get tracks from the database",
    (tracks) => {
      const tracksToAdd = [
        trackToPlay,
        ...tracks.filter((track) => track.id !== trackToPlay.id),
      ]

      setNewPlayback({
        index: 0,
        tracks: tracksToAdd,
        playback: {
          source: "tracks",
          sortBy: $playback.sortBy,
          isShuffleOn: true,
        },
      })
    },

    await getTracksFromSource({
      source: "tracks",
      isShuffleOn: true,
    })
  )
}

/**
 * Starts playback and initializes a new queue
 */
export async function playNewSource(newPlayback: INewPlayback, index = 0) {
  console.log("sourceStore:", get(playbackStore))
  console.log("new source:", newPlayback)
  console.log(dequal(get(playbackStore), newPlayback))

  // If the source stayed the same then just go to the specified index of the queue
  if (dequal($playback, newPlayback)) {
    indexStore.set(index)

    startPlayingCurrentTrack()
    return
  }

  // If the source has changed
  // For example: User played an album and then started playing an artist

  const defaultSort: ISortOptions["tracks"] = ["title", "ascending"]

  // Keep the old shuffle state if no new one was provided
  const newPlaybackToSet: INewPlayback = {
    sortBy: defaultSort,
    isShuffleOn: $isShuffleOn,
    ...newPlayback,
  }

  const tracksEither = await getTracksFromSource(newPlaybackToSet)

  doOrNotifyWithData(
    "Error while trying to play selected music",
    (tracks) => {
      setNewPlayback({
        tracks,
        index,
        playback: {
          sortBy: $playback.sortBy,
          isShuffleOn: $playback.isShuffleOn,
          ...newPlaybackToSet,
        }, // Default sort and shuffle will get overriden if it was specified in the argument
      })

      startPlayingCurrentTrack()
    },
    tracksEither
  )
}

async function playRandomTracksPlayback() {
  await goToRandomTracksPlayback()

  startPlayingCurrentTrack()
}

// async function setCurrentTrackByID(id: number) {
//   const queueIndex = $queue.findIndex(({ track }) => track.id === id)

//   indexStore.set(queueIndex)
// }

// Maybe better as only a new Playbacksource, which would set a new queue and index anyway
async function goToRandomTracksPlayback() {
  const playback = {
    source: "tracks",
    sortBy: ["title", "ascending"],
    isShuffleOn: true,
  } as const

  const tracksEither = await getTracksFromSource(playback)

  doOrNotifyWithData(
    "Error while trying to play selected music",
    (tracks) => {
      setNewPlayback({
        tracks,
        index: 0,
        playback,
      })
    },
    tracksEither
  )
}

/**
 * Sets a new playback. Does not start playing or change the playing status.
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
  indexStore.set(index)
  queueStore.setTracks(tracks, $currentIndex)
  playbackStore.set(playback)
}

function playNext() {
  // Update index
  indexStore.increment()

  startPlayingCurrentTrack()
}

function goToNextTrack() {
  indexStore.increment()
}

function handlePlayStateUpdate(newState: IPlayState) {
  $playState = newState

  if (newState === "PLAYING") {
    durationStore.set($currentTrack.track?.duration || 0)
    startIntervalUpdateTime()
  } else {
    cancelIntervalUpdateTime()
  }
}

function onVolumeChange() {
  volumeStore.set(audioPlayer.getVolume())
}

function startIntervalUpdateTime() {
  const newTime = audioPlayer.getCurrentTime()

  currentTimeStore.set(newTime)

  seekAnimationID = requestAnimationFrame(startIntervalUpdateTime)
}

function cancelIntervalUpdateTime() {
  cancelAnimationFrame(seekAnimationID)
}

function startPlayingCurrentTrack() {
  playStateStore.set("PLAYING")
  audioPlayer.play($currentTrack.track.filepath)
}

async function initialiseStores() {
  doOrNotifyWithData(
    "Failed to get tracks",
    (newTracks) => {
      if (newTracks.length === 0) return

      tracksStore.set(newTracks)
      queueStore.setTracks(newTracks, 0)
      audioPlayer.setSource(newTracks[0].filepath)
    },
    await window.api.getTracks()
  )

  doOrNotifyWithData(
    "Failed to get albums",
    albumsStore.set,
    await window.api.getAlbums()
  )

  doOrNotifyWithData(
    "Failed to get artists",
    artistsStore.set,
    await window.api.getArtists()
  )

  indexStore.reset()
}

async function handleSyncUpdate(
  _event: IpcRendererEvent,
  syncResult: ISyncResult
) {
  console.log("Sync update received")

  doOrNotifyWithData(
    "Failed to update the library. Please restart the app",
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

      const newIndex = queueStore.removeItemsFromNewTracks(
        sortedTracks,
        get(indexStore)
      )

      indexStore.set(newIndex)
    },
    syncResult
  )
}

async function getTracksFromSource(
  playback: INewPlayback
): Promise<Either<IError, readonly ITrack[]>> {
  return match(playback)
    .with({ source: "artists" }, async ({ sourceID, sortBy, isShuffleOn }) =>
      extractTracks(
        await window.api.getArtist({
          where: { name: sourceID },
          sortBy,
          isShuffleOn,
        })
      )
    )
    .with({ source: "albums" }, async ({ sourceID, sortBy, isShuffleOn }) =>
      extractTracks(
        await window.api.getAlbum({
          where: { name: sourceID },
          sortBy,
          isShuffleOn,
        })
      )
    )
    .with({ source: "tracks" }, ({ isShuffleOn, sortBy }) =>
      window.api.getTracks({ isShuffleOn, sortBy })
    )
    .with({ source: "playlists" }, () => {
      throw new Error(
        "Error at getTracksFromSource: Playlists are not implemented yet"
      )
    })
    .exhaustive()

  function extractTracks(
    item: Either<IError, { tracks: readonly ITrack[] }>,
    fromIndex = 0
  ): Either<IError, readonly ITrack[]> {
    return E.map(({ tracks }: { tracks: readonly ITrack[] }) =>
      tracks.slice(fromIndex)
    )(item)
  }
}

function resetCurrentTime() {
  currentTimeStore.set(0)
}

// Export some stores as read-only to prevent bugs
export const playIndex = { subscribe: indexStore.subscribe }
export const playState = { subscribe: playStateStore.subscribe }
export const volume = { subscribe: volumeStore.subscribe }
export const currentTime = { subscribe: currentTimeStore.subscribe }
export const tracks = { subscribe: tracksStore.subscribe }
export const albums = { subscribe: albumsStore.subscribe }
export const artists = { subscribe: artistsStore.subscribe }
export const queue = { subscribe: queueStore.subscribe }
