import type { FilePath } from "@sing-types/Filesystem"
import type { ITrack } from "@sing-types/Types"
import type { SvelteComponentDev } from "svelte/internal"
import type { AsyncOrSync } from "ts-essentials"

export type IPlayState = "PLAYING" | "PAUSED" | "STOPPED"
export type IPlayMode = "DEFAULT" | "REPEAT" | "SHUFFLE"
export type IPlayLoop = "NONE" | "LOOP_QUEUE" | "LOOP_TRACK"

export interface IQueueItem {
  readonly index: number
  readonly queueID: symbol
  readonly isManuallyAdded: boolean
  readonly track: ITrack
}

export type IHeroMetaDataItem = AsyncOrSync<{
  readonly label: string
  readonly to?: string
  readonly bold?: boolean
}>

export interface ITrackListDisplayOptions {
  readonly artist?: boolean
  readonly album?: boolean
  readonly cover?: boolean
}

export interface IHeroAction {
  readonly icon: typeof SvelteComponentDev | undefined
  readonly label: string
  readonly callback: (...arguments_: any[]) => void
  readonly primary?: boolean
}

export interface ICardProperties {
  readonly title: string
  readonly id: string
  readonly secondaryText?: string
  readonly image?: FilePath
}
