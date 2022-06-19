import type { Prisma, Track } from "@prisma/client"

export type IProccessedTrack = IProccessedTrackValid | IProccessedTrackFailed

export interface IProccessedTrackValid {
  ok: true
  track: Track
}
export interface IProccessedTrackFailed {
  ok: false
  track: Prisma.TrackCreateInput
  error: Error
}

export type ITrack = NullValuesToOptional<Track>

export type IElectronPaths =
  | "home"
  | "appData"
  | "userData"
  | "cache"
  | "temp"
  | "exe"
  | "module"
  | "desktop"
  | "documents"
  | "downloads"
  | "music"
  | "pictures"
  | "videos"
  | "recent"
  | "logs"
  | "crashDumps"

// https://stackoverflow.com/a/72668664/9578667
export type AllowedIndexes<
  T extends readonly any[],
  Result extends any[] = []
> = T extends readonly [infer _, ...infer Rest]
  ? AllowedIndexes<Rest, [...Result, Result["length"]]>
  : Result[number]
