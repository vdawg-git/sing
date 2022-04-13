import type { Track as ITrack } from "@prisma/client"

function createPlayer() {
  let audio = new Audio()

  audio.defaultPlaybackRate = 1
  // @ts-expect-error
  audio.setSinkId("default")
  audio.playbackRate = 1
  audio.volume = 1
  audio.muted = false

  return {
    play,

    setSource,

    getSource,

    resume() {
      audio.play()
    },

    pause() {
      audio.pause()
    },

    isPaused() {
      return audio.paused
    },

    setVolume(volume: number) {
      audio.volume = volume
    },
    getVolume() {
      return audio.volume
    },

    setMuted(muted: boolean) {
      audio.muted = muted
    },
    isMuted() {
      return audio.muted
    },

    getDuration() {
      return audio.duration
    },

    setSeek(seekTo: number) {
      audio.currentTime = seekTo
    },
    getSeek() {
      return audio.currentTime
    },
    setOutputDevice,
  }

  function play(src: string): void {
    console.log(`Playing ${src}`)
    setSource(src)
    try {
      audio.play()
    } catch (e) {
      console.group("Error with play in player")
      console.error(e)
      console.error(`filepath: \t ${src}`)
      console.groupEnd()
    }
  }

  function setSource(src: string) {
    audio.src = src
  }

  function getSource() {
    return audio.src
  }

  function setOutputDevice(output: string) {
    // @ts-expect-error
    audio.setSinkId(output)
  }
}

// type IPlaySatus = "PAUSED" | "PLAYING" | "STOPPED"
const player = createPlayer()

export default player
