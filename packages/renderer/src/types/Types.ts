import type { FilePath } from "@sing-types/Filesystem"
import type { ITrack } from "@sing-types/Types"
import type { SvelteComponentDev } from "svelte/internal"
import type { AsyncOrSync } from "ts-essentials"

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

export type IHeroMetaDataItem = AsyncOrSync<{
  label: string
  to?: string
  bold?: boolean
}>

export interface ITrackListDisplayOptions {
  readonly artist?: boolean
  readonly album?: boolean
  readonly cover?: boolean
}

export interface IHeroAction {
  icon: typeof SvelteComponentDev | undefined
  label: string
  callback: (...arguments_: any[]) => void
  primary?: boolean
}

export interface ICardProperties {
  title: string
  secondaryText?: string
  image?: FilePath
}
