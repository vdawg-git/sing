import { doOrNotifyEither, sortAlphabetically } from "@/Helper"
import audioPlayer from "@/lib/manager/player/AudioPlayer"
import { sortTracks } from "@sing-shared/Pures"
import { dequal } from "dequal"
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
  IError,
  IPlaySource,
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
const sourceStore = writable<IPlaySource>({
  type: "tracks",
  sort: ["title", "ascending"],
})

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
  ([$queue, $index]) => $queue.slice($index - 20 > 0 ? $index - 20 : 0, $index) // Display only the last 20 played tracks or less if there are no more
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
  async function playFromSource(source: IPlaySource, index = 0) {
    const { type, id, sort } = source

    console.log("sourceStore:", get(sourceStore))
    console.log("new source:", source)
    console.log(dequal(get(sourceStore), source))

    if (dequal(get(sourceStore), source)) {
      indexStore.set(index)

      startPlayingTrack($currentTrack.track)
      return
    }

    // If the source has changed (For exmaple: User played an album and then started playing an artist)
    const tracksEither = await getTracksFromSource({ type, id })

    doOrNotifyEither(
      tracksEither,
      "Error while trying to play selected music",
      (tracks) => {
        indexStore.set(index)
        queueStore.setTracks(sortTracks(sort)(tracks), $currentIndex)
        sourceStore.set(source)

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
  doOrNotifyEither(
    await window.api.getTracks({ orderBy: { title: "asc" } }),
    "Failed to get tracks",
    (tracks) => {
      if (tracks.length === 0) return

      tracksStore.set(tracks)
      queueStore.setTracks(tracks, 0)
      audioPlayer.setSource(tracks[0].filepath)
    }
  )

  doOrNotifyEither(
    await window.api.getAlbums(),
    "Failed to get albums",
    (albums) => {
      albumsStore.set(albums)
    }
  )

  doOrNotifyEither(
    await window.api.getArtists(),
    "Failed to get artists",
    (artists) => {
      artistsStore.set(artists)
    }
  )

  indexStore.set(0)
}

function handleSyncUpdate(_event: IpcRendererEvent, data: ISyncResult) {
  console.log("Sync update received")

  doOrNotifyEither(
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

async function getTracksFromSource({
  type,
  id,
}: Pick<IPlaySource, "type" | "id">): Promise<
  Either<IError, readonly ITrack[]>
> {
  switch ({ type, id }.type) {
    case "albums": {
      return extractTracks(
        await window.api.getAlbum({
          where: { name: id },
        })
      )
    }

    case "artists": {
      return extractTracks(
        await window.api.getArtistWithAlbumsAndTracks({
          where: { name: id },
        })
      )
    }

    case "tracks": {
      return window.api.getTracks()
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

export const player = createPlayerManager()

// Export stores only as read-only to prevent bugs
export const playIndex = { subscribe: indexStore.subscribe }
export const playState = { subscribe: playStateStore.subscribe }
export const volume = { subscribe: volumeStore.subscribe }
export const currentTime = { subscribe: currentTimeStore.subscribe }
export const tracks = { subscribe: tracksStore.subscribe }
export const albums = { subscribe: albumsStore.subscribe }
export const artists = { subscribe: artistsStore.subscribe }
export const queue = { subscribe: queueStore.subscribe }
