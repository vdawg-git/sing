import type { ITrack } from "@sing-types/Track"
import { Factory } from "fishery"

const trackFactory = Factory.define<ITrack>(({ sequence }) => {
  sequence = sequence - 1

  return {
    id: sequence,
    title: `Title ${sequence}`,
    artist: `Artist ${sequence}`,
    album: `Album ${sequence}`,
    filepath: `C:/Users/Music/file-${sequence}.mp3`,
    coverPath: `C:/Users/Music/cover-${sequence}.jpg`,
    duration: 12 + 1 / sequence,
  }
})

export default trackFactory
