import player from "./Player"
import queueStore from "@/lib/stores/QueueStore"
import type { ITrack } from "@sing-types/Track"
import { derived, writable } from "svelte/store"
import type { Unsubscriber } from "svelte/store"
import type {
  IQueueItem,
  IPlayLoop,
  IPlayMode,
  IPlayState,
  ISourceType,
  ILazyQueue,
} from "../../types/Types"
import tracksStore from "@/lib/stores/TracksStore"
import indexStore from "@/lib/stores/PlayIndex"

// Create stores / state
const playLoopStore = writable<IPlayLoop>("NONE")
const playModeStore = writable<IPlayMode>("DEFAULT")
const sourceTypeStore = writable<ISourceType>("NONE")
const sourceIDStore = writable<String>("")
const playStateStore = writable<IPlayState>("STOPPED")
const volumeStore = writable(1)
// const playedStore = writable<IQueueItem[]>([])

// Init stores with all tracks
initStores()

export const currentTrack = derived(
  [queueStore, indexStore],
  ([$queue, $index]) => {
    return $queue[$index]
  }
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
  let $playLoop: IPlayLoop = "LOOP_QUEUE"
  let $playMode: IPlayMode = "DEFAULT"
  let $sourceType: ISourceType = "NONE"
  let $sourceID: String = ""
  let $playState: IPlayState = "STOPPED"
  let $queue: IQueueItem[] = []
  let $index: number = -1
  // let $played: IQueueItem[] = []
  let $currentTrack: IQueueItem
  let $volume = 1
  // let lazyQueue: ILazyQueue

  // Subscribe to all stores and get the unsubscribers
  const unsubscribers: Unsubscriber[] = [
    queueStore.subscribe(($newQueue) => {
      $queue = $newQueue
    }),
    indexStore.subscribe(($newIndex) => {
      $index = $newIndex
    }),
    playLoopStore.subscribe(($loop) => ($playLoop = $loop)),
    playModeStore.subscribe(($mode) => ($playMode = $mode)),
    sourceTypeStore.subscribe(($source) => ($sourceType = $source)),
    sourceIDStore.subscribe(($id) => ($sourceID = $id)),
    playStateStore.subscribe(($state) => ($playState = $state)),
    volumeStore.subscribe(($newVolume) => ($volume = $newVolume)),
    currentTrack.subscribe(($newCurrentTrack) => {
      $currentTrack = $newCurrentTrack
    }),
    // playedStore.subscribe(($newPlayed) => ($played = $newPlayed)),
  ]

  return {
    playSource,
    pause,
    next,
    previous,
    setMuted,
    isMuted,
    resume,
    destroy,
  }

  /**
   * Starts playback and initializes the queue
   *
   * @param fromSource - input source of tracks (enum of "ALL_TRACKS", "ALBUM" etc..)
   * @param fromIndex - the index of the track within the source (which can be for example an album)
   */
  function playSource(
    track: ITrack,
    fromSource: ISourceType,
    sourceTracks: ITrack[],
    fromIndex: number
  ) {
    indexStore.increment()
    queueStore.setCurrent(track, $index)

    const sourcePreviousTracks = sourceTracks.slice(0, fromIndex)
    const sourceUpcomingTracks = sourceTracks.slice(fromIndex + 1) // +1 to remove the new current track of it

    queueStore.setUpcomingFromSource(
      [...sourceUpcomingTracks, ...sourcePreviousTracks],
      $index + 1
    )

    if (!$currentTrack) debugger

    playTrack($currentTrack.track)
  }

  function playTrack(track: ITrack) {
    playStateStore.set("PLAYING")
    player.play(track.filepath)
  }

  function resume() {
    playStateStore.set("PLAYING")

    player.resume()
  }

  function next() {
    // Update index
    indexStore.update((index) => {
      if (index >= $queue.length - 1) return 0
      return index + 1
    })

    //Play next song
    if ($playState === "STOPPED" || $playState === "PAUSED")
      player.setSource($currentTrack.track.filepath)
    else player.play($currentTrack.track.filepath)
  }

  function previous() {
    indexStore.update((index) => {
      if (index <= 0) return $queue.length - 1
      return index - 1
    })

    if ($playState === "STOPPED" || $playState === "PAUSED") return
    player.play($currentTrack.track.filepath)
  }

  function pause() {
    playStateStore.set("PAUSED")
    player.pause()
  }

  function setMuted(muted: boolean) {
    player.setMuted(muted)
  }

  function isMuted() {
    return player.isMuted()
  }

  function destroy() {
    unsubscribers.forEach((unsubscribe) => unsubscribe())
    player.pause()
    player.setSource("")
  }
}

function initStores() {
  const unsubTracks = tracksStore.subscribe(async ($tracks) => {
    $tracks = await $tracks
    if (!$tracks.length) return

    const queueItems: IQueueItem[] = $tracks.map((track, index) => {
      return { isManuallyAdded: false, track, index }
    })
    queueStore.set(queueItems)
    indexStore.set(0)
    // player.setSource($tracks[0].filepath)
  })
  unsubTracks()
}

// Export stores as read only to prevent bugs
export const playIndex = { subscribe: indexStore.subscribe }
export const playLoop = { subscribe: playLoopStore.subscribe }
export const playMode = { subscribe: playModeStore.subscribe }
export const sourceType = { subscribe: sourceTypeStore.subscribe }
export const sourceID = { subscribe: sourceIDStore.subscribe }
export const playState = { subscribe: playStateStore.subscribe }
export const volume = { subscribe: volumeStore.subscribe }
// export const played = { subscribe: playedStore.subscribe }

const manager = createPlayerManager()
export default manager
