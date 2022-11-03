import {
  computePosition,
  flip,
  offset,
  platform,
  shift,
} from "@floating-ui/dom"
import IconArrowRight from "virtual:icons/heroicons/arrow-right"
import { isDefined } from "ts-is-present"

import type {
  IMenu,
  IMenuItemArgument,
  IMenuID,
  IMenuLocation,
  ISubmenuItemArgument,
} from "@/types/Types"

// TODO UX Improvment: When the menu / contetx menu is activated, highlight or show that corresponding trigger.
// This could be achieved by passing a "onMenuActivated" and a "onMenuClosed" callback, which could then set the state.
// For example, when right clicking a track, the track should be highlighted, when the user clicks away, it gets set to the default state

/**
 *
 * @param items The menu items to display. Submenus are nested inside the type {@link ISubmenuItemArgument}.
 * @param setMenuID The callback to call when a user presses on an item which opens a submenu.
 * @param id DO NOT SET THIS. This is used internally for the recursion.
 * @param title DO NOT SET THIS. This is used internally for the recursion.
 * @returns The menus.
 */
export function createMenu(
  items: readonly (IMenuItemArgument | ISubmenuItemArgument)[],
  setMenuID: (id: symbol | "main") => void,
  closeMenu: () => void,
  previousMenu?: IMenuID,
  id: IMenuID = "main",
  title = "main"
): readonly IMenu[] {
  // If no items are submenus, just return them as a menu
  if (items.every(isIMenuArgument)) {
    return [
      {
        id,
        title,
        items: items.map(addCloseMenuOnClick(closeMenu)),
        previousMenu,
      },
    ]
  }

  const raw: readonly (
    | IMenuItemArgument
    | { transformedSubMenuItem: IMenuItemArgument; menus: readonly IMenu[] }
  )[] = items.map((item) =>
    item.type === "item"
      ? item
      : getItemAndMenusOfSubItem(item, id, setMenuID, closeMenu)
  )

  const subMenus: readonly IMenu[] = raw
    .flatMap((item) => (isIMenuArgument(item) ? [] : item))
    .flatMap(({ menus }) => menus)

  const thisMenu: IMenu = {
    id,
    title,
    previousMenu,
    items: raw.map((item) =>
      isIMenuArgument(item)
        ? addCloseMenuOnClick(closeMenu)(item)
        : item.transformedSubMenuItem
    ),
  }

  return [thisMenu, ...subMenus]
}

function getItemAndMenusOfSubItem(
  { label, icon, subMenu }: ISubmenuItemArgument,
  previousMenu: IMenuID,
  setMenuID: (id: symbol | "main") => void,
  closeMenu: () => void
): {
  readonly transformedSubMenuItem: IMenuItemArgument
  readonly menus: readonly IMenu[]
} {
  const id = Symbol(`Menu ID: ${label}`)

  return {
    transformedSubMenuItem: {
      label,
      leadingIcon: icon,
      trailingIcon: IconArrowRight,
      type: "item",
      onClick: () => setMenuID(id),
    },
    menus: createMenu(subMenu, setMenuID, closeMenu, previousMenu, id, label),
  }
}

/**
 * Calculates the positon of the menu as a dropdown- or context menu.
 *
 * isFlipping disabled the menu flipping to the other side of the reference element, for example the cursor.
 * Currently this is used to disable flipping when navigating into a subMenu, as this creates weird jumps.
 */
export async function calculatePosition(options: {
  nodeOrPosition: IMenuLocation
  menuElement: HTMLElement
  isFlipping?: boolean
}): Promise<{ x: number; y: number }> {
  // Is the given menu location a HTMLElement to which we want to attach the menu
  if ("addEventListener" in options.nodeOrPosition) {
    return computePosition(options.nodeOrPosition, options.menuElement, {
      platform,
      placement: "bottom",
      middleware: [
        offset(4),
        options.isFlipping ? flip() : undefined,
        shift({
          padding: 4, // Does not seem to change anything
          crossAxis: !options.isFlipping, // Does not seem to change anything, I hoped this would solve the submenu shifting at the edge, edge case
        }),
      ].filter(isDefined),
    })
  }

  // The given reference element is for the context menu
  const { clientX, clientY } = options.nodeOrPosition

  // Use a fake element as the reference for the position of the context menu
  const fakeHTMLElement = {
    clientHeight: 1,
    clientWidth: 1,
    clientLeft: clientX,
    clientTop: clientY,

    getBoundingClientRect: () => ({
      x: clientX,
      y: 500,
      top: clientY,
      bottom: clientY,
      left: clientX,
      right: clientX,
      width: 0,
      height: 0,
    }),
  }

  return computePosition(fakeHTMLElement, options.menuElement, {
    placement: "bottom-start",
    strategy: "fixed",
    middleware: [
      options.isFlipping ? flip() : undefined,
      shift({ padding: 4, crossAxis: !options.isFlipping }),
    ].filter(isDefined),
  })
}

function isIMenuArgument(argument_: unknown): argument_ is IMenuItemArgument {
  return (argument_ as unknown as IMenuItemArgument)?.type === "item"
}

function addCloseMenuOnClick(
  closeMenu: () => void
): (item: IMenuItemArgument) => IMenuItemArgument {
  return (item: IMenuItemArgument) => ({
    ...item,
    onClick: () => {
      item.onClick()
      closeMenu()
    },
  })
}
