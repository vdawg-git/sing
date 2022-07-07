import { IRawAudioMetadata } from "@sing-types/Types"
import { Factory } from "fishery"
import { musicFolder } from "../Helper/Consts"

const rawMetaDataFactory = Factory.define<
  IRawAudioMetadata,
  { hasCover?: boolean; hasUniqueCover?: boolean; forcedSequence?: number }
>(({ transientParams, sequence }) => {
  const hasCover = transientParams.hasCover ?? true
  const hasUniqueCover = transientParams.hasCover ?? false

  sequence =
    transientParams?.forcedSequence !== undefined &&
    transientParams?.forcedSequence !== NaN &&
    transientParams?.forcedSequence !== null
      ? transientParams.forcedSequence
      : sequence - 1

  return {
    filepath: `${musicFolder}${sequence.toString()}.mp3`,
    format: {
      tagTypes: ["ID3v2.3", "ID3v1"],
      trackInfo: [],
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
    },
    native: {
      "ID3v2.3": [
        { id: "TALB", value: sequence },
        { id: "TPE1", value: sequence },
        { id: "TPE2", value: sequence },
        { id: "TENC", value: "X" },
        {
          id: "COMM",
          value: { language: "eng", description: "", text: "comment" },
        },
        { id: "TCOM", value: sequence },
        { id: "TPOS", value: "1" },
        { id: "TCON", value: sequence.toString() },
        { id: "TIT2", value: sequence },
        { id: "TRCK", value: "1" },
        { id: "TYER", value: "2002" },
        {
          id: "APIC",
          value: {
            format: "image/png",
            type: "Cover (front)",
            description: "",
            data: Buffer.from("test"),
          },
        },
      ],
      ID3v1: [
        { id: "title", value: sequence.toString() },
        { id: "artist", value: sequence.toString() },
        { id: "album", value: sequence.toString() },
        { id: "comment", value: "comment" },
        { id: "track", value: sequence },
        { id: "year", value: 2002 },
      ],
    },
    quality: {
      warnings: [
        {
          message: "Invalid ID3v2.3 frame-header-ID: \u0000\u0000\u0000\u0000",
        },
        {
          message: "id3v2.3 header has empty tag type=\u0000\u0000\u0000\u0000",
        },
        {
          message: "Invalid ID3v2.3 frame-header-ID: \u0000\u0000\u0000\u0000",
        },
      ],
    },
    common: {
      track: { no: 1, of: null },
      disk: { no: 1, of: null },
      movementIndex: {},
      album: sequence.toString(),
      artists: [sequence.toString()],
      artist: sequence.toString(),
      albumartist: sequence.toString(),
      encodedby: "X",
      comment: ["comment"],
      composer: [sequence.toString()],
      genre: [sequence.toString()],
      title: sequence.toString(),
      year: 2002,
      ...(hasCover && {
        picture: [
          {
            format: "image/png",
            type: "Cover (front)",
            description: sequence.toString() + " cover",
            data: hasUniqueCover
              ? Buffer.from(sequence.toString())
              : Buffer.from("1"),
          },
        ],
      }),
    },
  }
})

export default rawMetaDataFactory
