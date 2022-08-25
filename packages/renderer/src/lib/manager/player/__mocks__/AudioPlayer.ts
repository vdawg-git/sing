function createPlayer() {
  const audio = document.createElement("audio")

  audio.defaultPlaybackRate = 1

  audio.playbackRate = 1
  audio.volume = 1
  audio.muted = false

  return {
    audio,

    destroy: vi.fn(),

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

  function play(source: string): void {
    setSource(source)
  }

  function setSource(source: string) {
    audio.src = source
  }

  function getSource() {
    return audio.src
  }

  // eslint-disable-next-line unicorn/consistent-function-scoping
  function setOutputDevice(output: string) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const doNothing = output
  }
}

const player = createPlayer()

export default player
