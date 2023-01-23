import { createHash } from "node:crypto"

import { Factory } from "fishery"

import { coversDirectory, musicFolder } from "../helper/Consts"

import type { Prisma } from "@prisma/client"

class MetaDataFactory extends Factory<
  Prisma.TrackCreateInput,
  {
    hasCover?: boolean
    hasUniqueCover?: boolean
    isDbItem?: boolean
    forcedSequence?: number
    hasID?: boolean
  }
> {
  dbItem() {
    return this.transient({ isDbItem: true })
  }

  uniqueCover() {
    return this.transient({ hasUniqueCover: true })
  }

  hasID(hasID: boolean) {
    return this.transient({ hasID })
  }

  hasCover(hasCover: boolean) {
    return this.transient({ hasCover })
  }

  forcedSequence(int: number) {
    return this.transient({ forcedSequence: int })
  }
}

const metaDataFactory = MetaDataFactory.define(
  ({ transientParams, sequence }) => {
    const hasCover = transientParams.hasCover ?? true
    const hasUniqueCover = transientParams.hasUniqueCover ?? false
    const isDatabaseItem = transientParams.isDbItem ?? false
    const hasID = transientParams.hasID ?? false

    // eslint-disable-next-line no-param-reassign
    sequence =
      transientParams?.forcedSequence !== undefined &&
      !Number.isNaN(transientParams?.forcedSequence) &&
      transientParams?.forcedSequence !== null
        ? transientParams.forcedSequence
        : sequence - 1

    const coverMD5 = hasUniqueCover
      ? createHash("md5").update(Buffer.from(sequence.toString())).digest("hex")
      : "f3cfe268a034c82c551b78a8cfd0534e"
    const coverPath = `${coversDirectory + coverMD5}.png`

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
      sampleRate: 44_100,
      numberOfChannels: 2,
      bitrate: 320_000,
      codecProfile: "CBR",
      tool: "tool",
      trackGain: sequence,
      numberOfSamples: sequence,
      duration: sequence,
      ...(hasCover && {
        coverMD5,
        coverPath,
      }),
      ...(isDatabaseItem && {
        playCount: 0,
        skipCount: 0,
        ...(hasID && { id: sequence + 1 }),
      }),
    }
  }
)

export default metaDataFactory
