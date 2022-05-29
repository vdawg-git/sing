function createPlayer() {
  let audio = new window.Audio()

  audio.defaultPlaybackRate = 1
  // @ts-expect-error
  audio.setSinkId("default")
  audio.playbackRate = 1
  audio.volume = 1
  audio.muted = false

  return {
    audio,

    play,

    setSource,

    getSource,

    resume() {
      try {
        audio.play()
      } catch (e) {
        console.error(e)
        console.error(`filepath: \t ${audio.src}`)
      }
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

    setSeek(seekToPercentage: number) {
      audio.currentTime = (audio.duration / 100) * seekToPercentage
    },

    getCurrentTime() {
      return audio.currentTime
    },
    setOutputDevice,
  }

  function play(src: string): void {
    setSource(src)
    try {
      audio.play()
    } catch (e) {
      console.error(e)
      console.error(`filepath: \t ${src}`)
    }
  }

  function setSource(src: string) {
    audio.src = "file://" + src
  }

  function getSource() {
    return audio.src
  }

  function setOutputDevice(output: string) {
    // @ts-expect-error
    audio.setSinkId(output)
  }
}

const audioPlayer = createPlayer()

export default audioPlayer
