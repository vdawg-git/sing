// TODO check which formats are *fully* supported by Chrome.

export const ALL_MUSIC_FORMATS = [
  "3gp",
  "aac",
  "aif",
  "aifc",
  "aiff",
  "ape",
  "asf",
  "bwf",
  "caf",
  "dolby",
  "flac",
  "m4a",
  "m4b",
  "m4p",
  "m4r",
  "m4v",
  "mk3d",
  "mka",
  "mks",
  "mkv",
  "mp+",
  "mp2",
  "mp3",
  "mp4",
  "mp4",
  "mpc",
  "mpeg",
  "mpp",
  "oga",
  "ogg",
  "ogm",
  "ogv",
  "ogx",
  "opus",
  "spx",
  "wav",
  "wave",
  "weba",
  "webm",
  "wma",
  "wmv",
  "wv",
] as const

export const SUPPORTED_MUSIC_FORMATS = [
  "flac",
  "mp3",
] as const satisfies Readonly<typeof ALL_MUSIC_FORMATS[number][]>

export const UNSUPPORTED_MUSIC_FORMATS = ALL_MUSIC_FORMATS.filter(
  (format) =>
    !(SUPPORTED_MUSIC_FORMATS as ReadonlyArray<string>).includes(format)
)
