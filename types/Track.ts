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
