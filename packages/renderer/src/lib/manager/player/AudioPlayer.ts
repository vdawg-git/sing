import { TEST_IDS } from "@/TestConsts"

function createPlayer() {
  const audio = document.createElement("audio")
  audio.style.display = "none"
  audio.dataset.testid = TEST_IDS.testAudioELement
  document.body.append(audio)

  audio.defaultPlaybackRate = 1
  // @ts-expect-error
  audio.setSinkId("default")
  audio.playbackRate = 1
  audio.volume = 1
  audio.muted = false

  /**
   * Used to fade out the audio
   */
  let previousVolume: number | undefined = undefined
  let fadeInterval: NodeJS.Timer // Used to fade out the audio

  return {
    audio,

    play,

    setSource,

    getSource,

    resume() {
      // Clear the interval of the pause (nessecary if the play/pause button gets spammed)
      // And restore the volume to before the pause
      clearInterval(fadeInterval)
      try {
        restoreVolume()

        audio.play()
      } catch (error) {
        console.error(error)
        console.error(`filepath: \t ${audio.src}`)
      }
    },

    pause() {
      // Save the volume before fading it to zero
      previousVolume = audio.volume

      // Fade the volume, then pause
      fadeInterval = setInterval(async () => {
        if (audio.volume <= 0) {
          clearInterval(fadeInterval)
          audio.pause()
        }
        this.setVolume(audio.volume > 0.1 ? audio.volume - 0.1 : 0)
      }, 20)
    },

    pauseWithoutFadeOut() {
      previousVolume = audio.volume

      audio.pause()
    },

    isPaused() {
      return audio.paused
    },

    setVolume,

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

    setSeekPercentage(seekToPercentage: number) {
      audio.currentTime = (audio.duration / 100) * seekToPercentage
    },

    resetCurrentTime() {
      audio.currentTime = 0
    },

    getCurrentTime() {
      return audio.currentTime
    },
    setOutputDevice,

    destroy,
  }

  function play(source: string): void {
    setSource(source)
    try {
      restoreVolume()

      audio.play()
    } catch (error) {
      console.error(error)
      console.error(`filepath: \t ${source}`)
    }
  }

  function setVolume(volume: number) {
    audio.volume = volume
  }

  /**
   * If the volume has been set to 0 by the pause fade, restore it to the value before it.
   */
  function restoreVolume() {
    if (previousVolume) {
      setVolume(previousVolume)
      previousVolume = undefined
    }
  }

  function setSource(source: string) {
    audio.src = `file://${source}`
  }

  function getSource() {
    return audio.src
  }

  function setOutputDevice(output: string) {
    // @ts-expect-error
    audio.setSinkId(output)
  }

  function destroy() {
    audio.pause()
    audio.src = ""
    audio.remove()
  }
}

export const audioPlayer = createPlayer()
