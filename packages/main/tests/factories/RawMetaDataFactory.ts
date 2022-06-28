import type { IAudioMetadata } from "music-metadata"
import { Factory } from "fishery"

const rawMetaDataFactory = Factory.define<IAudioMetadata>(({ sequence }) => {
  sequence = sequence - 1

  return {
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
      trackGain: 0.8,
      numberOfSamples: 3625344,
      duration: 82.201,
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
        { id: "track", value: 1 },
        { id: "year", value: "2002" },
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
      picture: [
        {
          format: "image/png",
          type: "Cover (front)",
          description: "",
          data: Buffer.from("test"),
        },
      ],
    },
  }
})

export default rawMetaDataFactory
