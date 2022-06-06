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
