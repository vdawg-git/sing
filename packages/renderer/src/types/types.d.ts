import type { IPlayLoop, IPlayState } from "./Types"

declare global {
  interface Window {
    testAPI: {
      volume: number
      playState: IPlayState
      playLoop: IPlayLoop
      isAudioPlaying: boolean
    }
  }
}
