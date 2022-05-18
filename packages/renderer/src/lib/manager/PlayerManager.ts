import { derived, writable } from "svelte/store"
import audioPlayer from "@/lib/manager/AudioPlayer"
import queueStore from "@/lib/stores/QueueStore"
import tracksStore from "@/lib/stores/TracksStore"
import indexStore from "@/lib/stores/PlayIndex"
import type { ITrack } from "@sing-types/Track"
import type { Unsubscriber } from "svelte/store"
import { get } from "svelte/store"
import type {
  IQueueItem,
  IPlayLoop,
  IPlayMode,
  IPlayState,
  ISourceType,
} from "@/types/Types"

// Create stores / state
const playLoopStore = writable<IPlayLoop>("NONE")
const playModeStore = writable<IPlayMode>("DEFAULT")
const sourceTypeStore = writable<ISourceType>("NONE")
const sourceIDStore = writable<String>("")
const playStateStore = writable<IPlayState>("STOPPED")
const volumeStore = writable(1)

// Init stores with all tracks
initStores()

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

// Export stores as read-only to prevent bugs
export const playIndex = { subscribe: indexStore.subscribe }
export const playLoop = { subscribe: playLoopStore.subscribe }
export const playMode = { subscribe: playModeStore.subscribe }
export const sourceType = { subscribe: sourceTypeStore.subscribe }
export const sourceID = { subscribe: sourceIDStore.subscribe }
export const playState = { subscribe: playStateStore.subscribe }
export const volume = { subscribe: volumeStore.subscribe }

// Export default
const manager = createPlayerManager()
export default manager

function createPlayerManager() {
  let $playLoop: IPlayLoop = "LOOP_QUEUE"
  let $playMode: IPlayMode = "DEFAULT"
  let $sourceType: ISourceType = "NONE"
  let $sourceID: String = ""
  let $playState: IPlayState = "STOPPED"
  let $queue: IQueueItem[] = []
  let $currentIndex: number = -1
  let $currentTrack: IQueueItem
  let $volume = 1

  // Subscribe to all stores and get the unsubscribers
  const unsubscribers: Unsubscriber[] = [
    queueStore.subscribe(($newQueue) => {
      $queue = $newQueue
    }),
    indexStore.subscribe(($newIndex) => {
      $currentIndex = $newIndex
    }),
    playLoopStore.subscribe(($loop) => ($playLoop = $loop)),
    playModeStore.subscribe(($mode) => ($playMode = $mode)),
    sourceTypeStore.subscribe(($source) => ($sourceType = $source)),
    sourceIDStore.subscribe(($id) => ($sourceID = $id)),
    playStateStore.subscribe(($state) => ($playState = $state)),
    volumeStore.subscribe(($newVolume) => ($volume = $newVolume)),
    currentTrack.subscribe(
      ($newCurrentTrack) => ($currentTrack = $newCurrentTrack)
    ),
  ]

  return {
    removeIndexFromQueue,
    destroy,
    isMuted,
    next,
    pause,
    playQueueIndex,
    playSource,
    previous,
    resume,
    setMuted,
  }

  /**
   * Starts playback and initializes the queue
   */
  function playSource(
    track: ITrack,
    fromSource: ISourceType,
    sourceTracks: ITrack[],
    fromIndex: number
  ) {
    indexStore.increment()
    queueStore.setCurrent(track, $currentIndex)

    const sourcePreviousTracks = sourceTracks.slice(0, fromIndex)
    const sourceUpcomingTracks = sourceTracks.slice(fromIndex + 1) // +1 to remove the new current track of it

    queueStore.setUpcomingFromSource(
      [...sourceUpcomingTracks, ...sourcePreviousTracks],
      $currentIndex + 1
    )

    playTrack($currentTrack.track)
  }

  function playTrack(track: ITrack) {
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

    //Play next song
    if ($playState === "STOPPED" || $playState === "PAUSED")
      audioPlayer.setSource($currentTrack.track.filepath)
    else audioPlayer.play($currentTrack.track.filepath)
  }

  function previous() {
    indexStore.update((index) => {
      if (index <= 0) return $queue.length - 1
      return index - 1
    })

    if ($playState === "STOPPED" || $playState === "PAUSED") return
    audioPlayer.play($currentTrack.track.filepath)
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
    unsubscribers.forEach((unsubscribe) => unsubscribe())
    audioPlayer.pause()
    audioPlayer.setSource("")
  }

  function playQueueIndex(index: number): void {
    indexStore.set(index)

    playTrack($currentTrack.track)
  }

  function removeIndexFromQueue(index: number): void {
    queueStore.removeIndex(index)

    if (index < $currentIndex) {
      indexStore.decrement() // So that the current track stays the same
    }

    if ($currentIndex === index && $playState === "PLAYING") {
      playTrack($currentTrack.track)
    }
  }
}

async function initStores() {
  const tracks = await get(tracksStore)

  if (!tracks.length) return

  const queueItems: IQueueItem[] = tracks.map((track, index) => {
    return {
      index,
      isManuallyAdded: false,
      track,
      queueID: Symbol(track?.title + " " + "queueID"),
    }
  })
  queueStore.set(queueItems)
  indexStore.set(0)
}
