import audioPlayer from "@/lib/manager/AudioPlayer"
import indexStore from "@/lib/stores/PlayIndex"
import queueStore from "@/lib/stores/QueueStore"
import tracksStore from "@/lib/stores/TracksStore"
import type {
  IPlayLoop,
  IPlayMode,
  IPlayState,
  IQueueItem,
  ISourceType,
} from "@/types/Types"
import type { ITrack } from "@sing-types/Track"
import type { Unsubscriber } from "svelte/store"
import { derived, get, writable } from "svelte/store"

// Create stores / state
const playLoopStore = writable<IPlayLoop>("NONE")
const playModeStore = writable<IPlayMode>("DEFAULT")
const sourceTypeStore = writable<ISourceType>("NONE")
const sourceIDStore = writable<String>("")
const playStateStore = writable<IPlayState>("STOPPED")
const volumeStore = writable(1)
const currentTimeStore = writable(0)
const durationStore = writable(0)

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
export const currentTime = { subscribe: currentTimeStore.subscribe }

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
  let $currentTime: number
  let $volume = 1
  let seekAnimationID: number

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
    playStateStore.subscribe(($state) => handlePlayStateUpdate($state)),
    volumeStore.subscribe(($newVolume) => ($volume = $newVolume)),
    currentTrack.subscribe(
      ($newCurrentTrack) => ($currentTrack = $newCurrentTrack)
    ),
    currentTimeStore.subscribe(
      ($newCurrentTime) => ($currentTime = $newCurrentTime)
    ),
  ]

  // Events
  audioPlayer.audio.onended = handleTrackEnded

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
    seekTo,
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

  function seekTo(percentage: number) {
    const newCurrentTime = ($currentTrack.track.duration || 0) * percentage
    audioPlayer.audio.currentTime = newCurrentTime

    currentTimeStore.set(newCurrentTime)
  }

  function intervalUpdateTime() {
    const currentTime = audioPlayer.getCurrentTime()

    currentTimeStore.set(currentTime)

    seekAnimationID = requestAnimationFrame(intervalUpdateTime)
  }

  function cancelIntervalUpdateTime() {
    cancelAnimationFrame(seekAnimationID)
  }

  function resetCurrentTime() {
    currentTimeStore.set(0)
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
    resetCurrentTime()

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
    resetCurrentTime()

    if ($playState === "STOPPED" || $playState === "PAUSED")
      audioPlayer.setSource($currentTrack.track.filepath)

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

  if (!tracks?.length) return

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
  audioPlayer.setSource(queueItems[0].track.filepath)
}
