import type { ITrack } from "@sing-types/Track"

export type IPlayState = "PLAYING" | "PAUSED" | "STOPPED"
export type ISourceType =
  | "NONE"
  | "ALL_TRACKS"
  | "ALBUM"
  | "MANUAL"
  | "PLAYLIST"
  | "ARTIST"
export type IPlayMode = "DEFAULT" | "REPEAT" | "SHUFFLE"
export type IPlayLoop = "NONE" | "LOOP_QUEUE" | "LOOP_TRACK"

export interface IQueueItem {
  index: number
  readonly queueID: symbol
  readonly isManuallyAdded: boolean
  readonly track: ITrack
}

export type AnyObject = { [P in number | string | symbol]: any }
