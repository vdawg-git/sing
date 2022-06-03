function createPlayer() {
  let audio = document.createElement("audio")

  audio.defaultPlaybackRate = 1

  audio.playbackRate = 1
  audio.volume = 1
  audio.muted = false

  if (import.meta.env.DEV) {
    audio.onplay = () => {
      window.testAPI.isAudioPlaying = true
    }

    audio.onended = setTestPlayStateToFalse
    audio.onpause = setTestPlayStateToFalse

    function setTestPlayStateToFalse() {
      window.testAPI.isAudioPlaying = false
    }
  }

  return {
    audio,

    getCurrentTime: vi.fn(() => 100),

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

const player = createPlayer()

export default player
