import { computePosition, flip, offset, platform, shift } from "@floating-ui/dom"
import IconArrowRight from "virtual:icons/heroicons/arrow-right"

import type {
  IMenu,
  IMenuArgumentItem,
  IMenuID,
  IMenuLocation,
  ISubmenuArgumentItem,
} from "@/types/Types"

/**
 *
 * @param items The menu items to display. Submenus are nested inside the type {@link ISubmenuArgumentItem}.
 * @param setMenuID The callback to call when a user presses on an item which opens a submenu.
 * @param id DO NOT SET THIS. This is used internally for the recursion.
 * @param title DO NOT SET THIS. This is used internally for the recursion.
 * @returns The menus.
 */
export function createMenu(
  items: readonly (IMenuArgumentItem | ISubmenuArgumentItem)[],
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
        items,
        previousMenu,
      },
    ]
  }

  const raw: readonly (
    | IMenuArgumentItem
    | { transformedSubMenuItem: IMenuArgumentItem; menus: readonly IMenu[] }
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
        ? {
            ...item,
            onClick: () => {
              item.onClick()
              closeMenu()
            },
          }
        : item.transformedSubMenuItem
    ),
  }

  return [thisMenu, ...subMenus]
}

function getItemAndMenusOfSubItem(
  { label, icon, subMenu }: ISubmenuArgumentItem,
  previousMenu: IMenuID,
  setMenuID: (id: symbol | "main") => void,
  closeMenu: () => void
): {
  readonly transformedSubMenuItem: IMenuArgumentItem
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
 * @param isAlreadyOpened Wheter to recalculate the already open menu position or if it is positioned initially.
 */
export async function calculatePosition(
  nodeOrPosition: IMenuLocation,
  menuElement: HTMLElement
): Promise<{ x: number; y: number }> {
  // Is the given menu location a HTMLElement to which we want to attach the menu
  if ("addEventListener" in nodeOrPosition) {
    return computePosition(nodeOrPosition, menuElement, {
      platform,
      placement: "bottom",
      middleware: [offset(4), flip(), shift({ padding: 4 })],
    })
  }

  // The given reference element is for the context menu
  const { clientX, clientY } = nodeOrPosition

  // Use a fake element as the reference for the position of the context menu
  const fakeHTMLElement = {
    clientHeight: 1,
    clientWidth: 1,
    clientLeft: clientX,
    clientTop: clientY,

    getBoundingClientRect: () => ({
      x: clientX,
      y: clientY,
      top: clientY,
      bottom: clientY,
      left: clientX,
      right: clientX,
      width: 0,
      height: 0,
    }),
  }

  return computePosition(fakeHTMLElement, menuElement, {
    placement: "bottom-end",
    strategy: "fixed",
    middleware: [offset(4), flip(), shift({ padding: 4 })],
  })
}

function isIMenuArgument(argument_: unknown): argument_ is IMenuArgumentItem {
  return (argument_ as unknown as IMenuArgumentItem)?.type === "item"
}

// const argument: readonly (IMenuArgumentItem | ISubmenuArgumentItem)[] = [
//   { label: "Item 1", onClick: () => {}, type: "item" },
//   { label: "Item 2", onClick: () => {}, type: "item" },
//   {
//     label: "SUB Item 3",
//     type: "subMenu",
//     subMenu: [
//       { label: "Item 2.1", onClick: () => {}, type: "item" },
//       {
//         label: "SUB Item 2.2",
//         type: "subMenu",
//         subMenu: [
//           { label: "Item 3.1", onClick: () => {}, type: "item" },
//           { label: "Item 3.3", onClick: () => {}, type: "item" },
//         ],
//       },
//       { label: "Item 2.3", onClick: () => {}, type: "item" },
//     ],
//   },
// ]
