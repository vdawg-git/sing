import type {
  IMenu,
  IMenuArgumentItem,
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
  id: "main" | symbol = "main",
  title = "main"
): readonly IMenu[] {
  // If no items are submenus, just return them as a menu
  if (items.every(isIMenuArgument)) {
    return [
      {
        id,
        title,
        items,
      },
    ]
  }

  const raw: readonly (
    | IMenuArgumentItem
    | { transformedSubMenuItem: IMenuArgumentItem; menus: readonly IMenu[] }
  )[] = items.map((item) =>
    item.type === "item" ? item : getItemAndMenusOfSubItem(item, setMenuID)
  )

  const subMenus: readonly IMenu[] = raw
    .flatMap((item) => (isIMenuArgument(item) ? [] : item))
    .flatMap(({ menus }) => menus)

  const thisMenu: IMenu = {
    id,
    title,
    items: raw.map((item) =>
      isIMenuArgument(item) ? item : item.transformedSubMenuItem
    ),
  }

  return [thisMenu, ...subMenus]
}

function getItemAndMenusOfSubItem(
  { label, icon, subMenu }: ISubmenuArgumentItem,
  setMenuID: (id: symbol | "main") => void
): {
  readonly transformedSubMenuItem: IMenuArgumentItem
  readonly menus: readonly IMenu[]
} {
  const id = Symbol(`Menu ID: ${label}`)

  return {
    transformedSubMenuItem: {
      label,
      icon,
      type: "item",
      onClick: () => setMenuID(id),
    },
    menus: createMenu(subMenu, setMenuID, id, label),
  }
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
