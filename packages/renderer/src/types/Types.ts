import type { FilePath } from "@sing-types/Filesystem"
import type { ITrack } from "@sing-types/Types"
import type { SvelteComponentDev } from "svelte/internal"
import type { AsyncOrSync } from "ts-essentials"

export type IPlayState = "PLAYING" | "PAUSED" | "STOPPED"
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

/**
 * The data to be used to render a menu.
 * It is the converted {@link IMenuArgumentItem}[ ]
 */
export type IMenu = {
  readonly id: symbol | "main"
  readonly title: string
  readonly items: readonly IMenuArgumentItem[]
}

/**
 * The data to be passed as an array to the menu constructor.
 * Similar to {@link IDropdownMeu}, but it gets converted internally, so that a nicer API can be used.
 */
export type IDropdownArgument = readonly (
  | IMenuArgumentItem
  | ISubmenuArgumentItem
)[]

export type IMenuArgumentItem = {
  readonly type: "item"
  readonly onClick: () => void
  readonly label: string
  readonly icon?: ConstructorOfATypedSvelteComponent
}

/**
 * A menu item which opens up a submenu on click.
 * @property subMenu The submenu to be displayed on click
 */
export type ISubmenuArgumentItem = {
  readonly type: "subMenu"
  readonly label: string
  readonly icon?: ConstructorOfATypedSvelteComponent
  readonly subMenu: readonly (IMenuArgumentItem | ISubmenuArgumentItem)[]
}
