import type { ITrack } from "@sing-types/Track"
import { Factory } from "fishery"

const trackFactory = Factory.define<ITrack>(({ sequence }) => {
  sequence = sequence - 1

  return {
    id: sequence,
    title: `Title ${sequence}`,
    artist: `Artist ${sequence}`,
    album: `Album ${sequence}`,
    filepath: `C:/Users/Music/file-${sequence}`,
    duration: 12.4542524,
  }
})

export default trackFactory
