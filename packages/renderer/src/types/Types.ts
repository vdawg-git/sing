import type { FilePath } from "@sing-types/Filesystem"
import type { ITrack } from "@sing-types/Types"

import type { SvelteComponentDev } from "svelte/internal"
import type { AsyncOrSync } from "ts-essentials"

export type IPlayState = "PLAYING" | "PAUSED" | "STOPPED"
export type IPlayLoop = "NONE" | "LOOP_QUEUE" | "LOOP_TRACK"

export type IQueueItem = {
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

export type ITrackListDisplayOptions = {
  readonly artist?: boolean
  readonly album?: boolean
  readonly cover?: boolean
}

export type IHeroAction = {
  readonly icon: typeof SvelteComponentDev | undefined
  readonly label: string
  readonly callback: (...arguments_: any[]) => void
  readonly primary?: boolean
}

/**
 * The type of the card element used on for examples the albums and playlists pages.
 */
export type ICardProperties = {
  readonly title: string
  readonly id: string | number
  readonly secondaryText?: string
  readonly image?: FilePath | readonly FilePath[]
  readonly contextMenuItems: IMenuItemsArgument
}

export type IMenuID = symbol | "main"

/**
 * The data to be used to render a menu.
 * It is the converted {@link IMenuItemArgument}[ ]
 */
export type IMenu = {
  readonly id: IMenuID
  readonly title: string
  readonly items: readonly IMenuItemArgument[]
  readonly previousMenu: IMenuID | undefined // Link the previous menu and not the next, as there can be mutliple next menus.
}

/**
 * Either the X and Y coordinates or an element for Popperjs to position the menu to.
 */
export type IMenuLocation =
  | HTMLElement
  | {
      clientX: number
      clientY: number
    }

/**
 * A single menu item
 */
export type IMenuItemArgument = {
  readonly type: "item"
  readonly onClick: () => void
  readonly label: string
  readonly leadingIcon?: ConstructorOfATypedSvelteComponent
  readonly trailingIcon?: ConstructorOfATypedSvelteComponent
}

/**
 * A single menu item which opens up a submenu on click.
 * Contains the submenu.
 * @property subMenu The submenu to be displayed on click
 */
export type ISubmenuItemArgument = {
  readonly type: "subMenu"
  readonly label: string
  readonly icon?: ConstructorOfATypedSvelteComponent
  readonly subMenu: IMenuItemsArgument
}

/**
 * The argument to open a menu with its items.
 * @param onEvent The event to trigger the opening of the menu.
 */
export type IOpenMenuArgument = {
  readonly menuItems: IMenuItemsArgument
  readonly onEvent?: keyof DocumentEventMap
  readonly testID?: string
}

/**
 * Menu items to be passed to the menu-factory.
 */
export type IMenuItemsArgument = readonly (
  | IMenuItemArgument
  | ISubmenuItemArgument
)[]
