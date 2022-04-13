import type { Track as ITrack } from "@prisma/client"
import { type SvelteComponentDev } from "svelte/internal"

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
export type ILazyQueue = (index: number) => ITrack | undefined

export interface IQueueItem {
  index: number
  isManuallyAdded: boolean
  track: ITrack
}
