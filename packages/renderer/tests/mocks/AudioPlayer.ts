function createPlayer() {
  let testIsPlaying = false
  let audio = document.createElement("audio")

  audio.defaultPlaybackRate = 1

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
    setSource(src)
    testIsPlaying = true
  }

  function setSource(src: string) {
    audio.src = src
  }

  function getSource() {
    return audio.src
  }

  function setOutputDevice(output: string) {
    // audio.setSinkId(output)
  }
}

// type IPlaySatus = "PAUSED" | "PLAYING" | "STOPPED"
const player = createPlayer()

export default player
