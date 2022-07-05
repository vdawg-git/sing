import { Prisma } from "@prisma/client"
import { Factory } from "fishery"

const metaDataFactory = Factory.define<
  Prisma.TrackCreateInput,
  { hasCover?: boolean }
>(({ transientParams, sequence }) => {
  const hasCover = transientParams.hasCover ?? true

  sequence = sequence - 1

  return {
    filepath: `C:/test/${sequence.toString()}.mp3`,
    genre: JSON.stringify([sequence.toString()]),
    trackNo: 1,
    trackOf: null,
    diskNo: 1,
    diskOf: null,
    album: sequence.toString(),
    artist: sequence.toString(),
    artists: JSON.stringify([sequence.toString()]),
    albumartist: sequence.toString(),
    encodedby: "X",
    comment: JSON.stringify(["comment"]),
    composer: JSON.stringify([sequence.toString()]),
    title: sequence.toString(),
    year: 2002,
    tagTypes: JSON.stringify(["ID3v2.3", "ID3v1"]),
    lossless: false,
    container: "MPEG",
    codec: "MPEG 1 Layer 3",
    sampleRate: 44100,
    numberOfChannels: 2,
    bitrate: 320000,
    codecProfile: "CBR",
    tool: "tool",
    trackPeakLevel: undefined,
    trackGain: sequence,
    numberOfSamples: sequence,
    duration: sequence,
    ...(hasCover && {
      coverMD5: "c4ca4238a0b923820dcc509a6f75849b",
      coverPath: "T:/test/covers/c4ca4238a0b923820dcc509a6f75849b.png",
    }),
  }
})

export default metaDataFactory
