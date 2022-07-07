import type { Prisma } from "@prisma/client"
import { Factory } from "fishery"
import { coverFolder, musicFolder } from "../helper/Consts"

class MetaDataFactory extends Factory<
  Prisma.TrackCreateInput,
  { hasCover?: boolean; isDbItem: boolean; forcedSequence: number }
> {
  dbItem() {
    return this.transient({ isDbItem: true })
  }

  withCover() {
    return this.transient({ hasCover: true })
  }

  sequenceNumber(int: number) {
    return this.transient({ forcedSequence: int })
  }
}

const metaDataFactory = MetaDataFactory.define(
  ({ transientParams, sequence }) => {
    const hasCover = transientParams.hasCover ?? true
    const isDbItem = transientParams.isDbItem ?? false

    sequence =
      transientParams?.forcedSequence !== undefined &&
      transientParams?.forcedSequence !== NaN &&
      transientParams?.forcedSequence !== null
        ? transientParams.forcedSequence
        : sequence - 1

    return {
      filepath: `${musicFolder}${sequence.toString()}.mp3`,
      genre: JSON.stringify([sequence.toString()]),
      trackNo: 1,
      diskNo: 1,
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
      trackGain: sequence,
      numberOfSamples: sequence,
      duration: sequence,
      ...(hasCover && {
        coverMD5: "c4ca4238a0b923820dcc509a6f75849b",
        coverPath: coverFolder + "c4ca4238a0b923820dcc509a6f75849b.png",
      }),
      ...(isDbItem && {
        id: sequence,
        playCount: 0,
        skipCount: 0,
      }),
    }
  }
)

export default metaDataFactory
