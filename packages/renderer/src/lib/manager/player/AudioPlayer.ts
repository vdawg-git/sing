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

  let previousVolume = audio.volume // Used to fade out the audio
  let fadeInterval: NodeJS.Timer // Used to fade out the audio

  return {
    audio,

    play,

    setSource,

    getSource,

    resume() {
      clearInterval(fadeInterval)
      try {
        // Clear the interval of the pause (nessecary if the play/pause button gets spammed)
        // And restore the volume before the pause
        audio.volume = previousVolume
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
        audio.volume = audio.volume > 0.1 ? audio.volume - 0.1 : 0
      }, 20)
    },

    pauseWithoutFadeOut() {
      previousVolume = audio.volume

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

    destroy,
  }

  function play(source: string): void {
    setSource(source)
    try {
      audio.play()
    } catch (error) {
      console.error(error)
      console.error(`filepath: \t ${source}`)
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
