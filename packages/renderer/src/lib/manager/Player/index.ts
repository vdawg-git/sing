import { doSideEffectWithEither, sortAlphabetically } from "@/Helper"
import audioPlayer from "@/lib/manager/player/AudioPlayer"
import { map as mapEither } from "fp-ts/lib/Either"
import { derived, get, writable } from "svelte/store"

import indexStore from "./stores/PlayIndex"
import queueStore from "./stores/QueueStore"

import type { Either } from "fp-ts/lib/Either"
import type { IPlayState, IQueueItem } from "@/types/Types"
import type {
  ITrack,
  ISyncResult,
  IAlbum,
  IArtist,
  IPlayFromSourceQuery,
  IError,
  ITracksSort,
} from "@sing-types/Types"
import type { Unsubscriber } from "svelte/store"
import type { IpcRendererEvent } from "electron"

// Create stores / state
const playStateStore = writable<IPlayState>("STOPPED")
const volumeStore = writable(1)
const currentTimeStore = writable(0)
const durationStore = writable(0)
const tracksStore = writable<readonly ITrack[]>([])
const albumsStore = writable<readonly IAlbum[]>([])
const artistsStore = writable<readonly IArtist[]>([])

// TODO add genre to the db, too

// Init stores with the music
await initialiseStores()

// Now it makes sense to create and use the derived stores
export const currentTrack = derived(
  [queueStore, indexStore],
  ([$queue, $index]) => $queue[$index]
)
export const playedTracks = derived(
  [queueStore, indexStore],
  ([$queue, $index]) => $queue.slice(0, $index)
)
export const nextTracks = derived(
  [queueStore, indexStore],
  ([$queue, $index]) => $queue.slice($index + 1)
)

function createPlayerManager() {
  let $playState: IPlayState = "STOPPED"
  let $queue: IQueueItem[] = []
  let $currentIndex = -1
  let $currentTrack: IQueueItem
  let seekAnimationID: number

  // Subscribe to all stores and get the unsubscribers
  const unsubscribers: Unsubscriber[] = [
    queueStore.subscribe(($newQueue) => {
      $queue = $newQueue
    }),
    indexStore.subscribe(($newIndex) => {
      $currentIndex = $newIndex
      resetCurrentTime()
    }),

    playStateStore.subscribe(handlePlayStateUpdate),
    currentTrack.subscribe(($newCurrentTrack) => {
      $currentTrack = $newCurrentTrack
    }),

    window.api.listen("syncedMusic", handleSyncUpdate),
  ]

  // Events
  audioPlayer.audio.addEventListener("ended", handleTrackEnded)
  audioPlayer.audio.addEventListener("volumechange", onVolumeChange)

  return {
    destroy,
    isMuted,
    next,
    pause,
    playQueueIndex: playFromQueue,
    playFromSource,
    previous,
    removeIndexFromQueue,
    resume,
    seekTo,
    setMuted,
    setVolume,
  }

  function handleTrackEnded() {
    next()
  }

  function handlePlayStateUpdate(newState: IPlayState) {
    $playState = newState

    if (newState === "PLAYING") {
      durationStore.set($currentTrack.track?.duration || 0)
      intervalUpdateTime()
    } else {
      cancelIntervalUpdateTime()
    }
  }

  function onVolumeChange() {
    volumeStore.set(audioPlayer.getVolume())
  }

  function setVolume(newVolume: number) {
    audioPlayer.setVolume(newVolume)
  }

  function seekTo(percentage: number) {
    const newCurrentTime = ($currentTrack.track.duration || 0) * percentage
    audioPlayer.audio.currentTime = newCurrentTime

    currentTimeStore.set(newCurrentTime)
  }

  function intervalUpdateTime() {
    const newTime = audioPlayer.getCurrentTime()

    currentTimeStore.set(newTime)

    seekAnimationID = requestAnimationFrame(intervalUpdateTime)
  }

  function cancelIntervalUpdateTime() {
    cancelAnimationFrame(seekAnimationID)
  }

  /**
   * Starts playback and initializes the queue
   */
  async function playFromSource(source: IPlayFromSourceQuery) {
    const tracksEither = await getSource(source, { title: "asc" })

    doSideEffectWithEither(
      tracksEither,
      "Error while trying to play selected music",
      (tracks) => {
        indexStore.increment()
        queueStore.setUpcomingFromSource(tracks, $currentIndex)

        startPlayingTrack($currentTrack.track)
      }
    )
  }

  function startPlayingTrack(track: ITrack) {
    playStateStore.set("PLAYING")
    audioPlayer.play(track.filepath)
  }

  function resume() {
    playStateStore.set("PLAYING")

    audioPlayer.resume()
  }

  function next() {
    // Update index
    indexStore.update((index) => {
      if (index >= $queue.length - 1) return 0
      return index + 1
    })

    // Play next song
    if ($playState === "STOPPED" || $playState === "PAUSED")
      audioPlayer.setSource($currentTrack.track.filepath)
    else audioPlayer.play($currentTrack.track.filepath)
  }

  function previous() {
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

  function pause() {
    playStateStore.set("PAUSED")
    audioPlayer.pause()
  }

  function setMuted(muted: boolean) {
    audioPlayer.setMuted(muted)
  }

  function isMuted() {
    return audioPlayer.isMuted()
  }

  function destroy() {
    for (const unsubscriber of unsubscribers) {
      unsubscriber()
    }

    audioPlayer.destroy()
  }

  /**
   * Play a track from the queue and update the index according to the track index in the queue.
   */
  function playFromQueue(index: number): void {
    indexStore.set(index)

    startPlayingTrack($currentTrack.track)
  }

  function removeIndexFromQueue(index: number): void {
    queueStore.removeIndex(index)

    if (index < $currentIndex) {
      indexStore.decrement() // So that the current track stays the same
    }

    if ($currentIndex === index && $playState === "PLAYING") {
      startPlayingTrack($currentTrack.track)
    }
  }
}

async function initialiseStores() {
  doSideEffectWithEither(
    await window.api.getTracks({ orderBy: { title: "asc" } }),
    "Failed to get tracks",
    (tracks) => {
      if (tracks.length === 0) return

      tracksStore.set(tracks)
      queueStore.setUpcomingFromSource(tracks, 0)
      audioPlayer.setSource(tracks[0].filepath)
    }
  )

  doSideEffectWithEither(
    await window.api.getAlbums(),
    "Failed to get albums",
    (albums) => {
      albumsStore.set(albums)
    }
  )

  doSideEffectWithEither(
    await window.api.getArtists(),
    "Failed to get artists",
    (artists) => {
      artistsStore.set(artists)
    }
  )

  indexStore.set(0)
}

function handleSyncUpdate(_event: IpcRendererEvent, data: ISyncResult) {
  doSideEffectWithEither(
    data,
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
    }
  )
}

async function getSource(
  source: IPlayFromSourceQuery,
  orderBy: ITracksSort
): Promise<Either<IError, readonly ITrack[]>> {
  switch (source.type) {
    case "album": {
      return extractTracks(
        await window.api.getAlbumWithTracks({
          prismaOptions: {
            where: { name: source.id },
          },
          orderBy,
        }),
        source.index
      )
    }
    case "artist": {
      return extractTracks(
        await window.api.getArtistWithTracks({
          prismaOptions: { where: { name: source.id } },
          orderBy,
        }),
        source.index
      )
    }
    case "track": {
      return mapEither((tracks: ITrack[]) => tracks.slice(source.index))(
        await window.api.getTracks({ orderBy })
      )
    }
    default:
      throw new Error("Invalid source specified at getSource in PlayerManager")
  }

  function extractTracks(
    item: Either<IError, { tracks: readonly ITrack[] }>,
    fromIndex = 0
  ): Either<IError, readonly ITrack[]> {
    return mapEither((album: { tracks: readonly ITrack[] }) =>
      album.tracks.slice(fromIndex)
    )(item)
  }
}

function resetCurrentTime() {
  currentTimeStore.set(0)
}

// Export default
const player = createPlayerManager()
export default player

// Export stores only as read-only to prevent bugs
export const playIndex = { subscribe: indexStore.subscribe }
export const playState = { subscribe: playStateStore.subscribe }
export const volume = { subscribe: volumeStore.subscribe }
export const currentTime = { subscribe: currentTimeStore.subscribe }
export const tracks = { subscribe: tracksStore.subscribe }
export const albums = { subscribe: albumsStore.subscribe }
export const artists = { subscribe: artistsStore.subscribe }
export const queue = { subscribe: queueStore.subscribe }
