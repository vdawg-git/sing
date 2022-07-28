import type { ITrack } from "@sing-types/Types"

export interface INotification {
  id: symbol
  label: string
  type?: INotificationTypes
  timeout?: number
}

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
export type INotificationTypes =
  | "loading"
  | "check"
  | "warning"
  | "danger"
  | "default"

export interface IQueueItem {
  index: number
  readonly queueID: symbol
  readonly isManuallyAdded: boolean
  readonly track: ITrack
}

export type AnyObject = { [P in number | string | symbol]: any }
