import { writable } from "svelte/store"

import type {
  IMenuItemsArgument,
  IMenuLocation,
  IOpenMenuArgument,
} from "@/types/Types"
import type { StrictOmit } from "ts-essentials"

/**
 * used to fix a bug with svelte transitions nulling the element reference.
 */
export const menuElementID = "menuElementWrapper"
export function getMenuElement() {
  return (document.querySelector(`#${menuElementID}`) ?? undefined) as
    | HTMLElement
    | undefined
}

type IMenu =
  | {
      readonly nodeOrPosition: IMenuLocation
      readonly items: IMenuItemsArgument
      /**
       * Only used for a regular menu, not for a context menu.
       */
      readonly triggerElement?: HTMLElement | HTMLElement[]

      /**
       * Gets called when the menu is opened.
       */
      readonly onCreate?: () => void
      /**
       * Gets called when the menu is closed, thus destroyed.
       */
      readonly onDestroy?: () => void
      readonly testID?: string
    }
  | undefined

const { set, subscribe } = writable<IMenu>()

/**
 * Create an use-directive action to open a menu.
 * By default it opens on:click of the element.
 *
 * This is differemt from {@link useOpenContextMenu}!
 * @return A function to be used with the `use` directive.
 */
export function createOpenMenu({
  menuItems,
  onEvent,
  testID,
}: IOpenMenuArgument): (node: HTMLElement) => { destroy: () => void } {
  return (node: HTMLElement) => {
    let isMenuOpen = false

    node.addEventListener(onEvent ?? "click", toggleMenu)

    return {
      destroy: () => {
        isMenuOpen = false
        node.removeEventListener(onEvent ?? "click", toggleMenu)
      },
    }

    function toggleMenu() {
      if (isMenuOpen) {
        // Close the menu
        isMenuOpen = false
        closeMenu()
      } else {
        // Open the menu
        isMenuOpen = true

        createMenu({
          items: menuItems,
          nodeOrPosition: node,
          testID,
          triggerElement: node,
          onDestroy() {
            isMenuOpen = false
          },
        })
      }
    }
  }
}

export function useOpenContextMenu(
  node: HTMLElement,
  parameters: StrictOmit<IOpenMenuArgument, "onEvent">
) {
  let onContextMenu = openContextMenu(parameters)

  // @ts-ignore TS wants this to take an `Event`, but I want it to take a PointerEvent.
  node.addEventListener("contextmenu", onContextMenu)

  return {
    // When the parameters change, update the event listener with the new values
    update: (newParameters: StrictOmit<IOpenMenuArgument, "onEvent">) => {
      // @ts-ignore
      node.removeEventListener("contextmenu", onContextMenu)

      onContextMenu = openContextMenu(newParameters)

      // @ts-ignore
      node.addEventListener("contextmenu", onContextMenu)
    },

    destroy: () => {
      // @ts-ignore
      node.removeEventListener("contextmenu", onContextMenu)
    },
  }
}

function openContextMenu({
  menuItems,
  testID,
}: StrictOmit<IOpenMenuArgument, "onEvent">): ({
  clientX,
  clientY,
}: PointerEvent) => void {
  return ({ clientX, clientY }) =>
    createMenu({
      items: menuItems,
      nodeOrPosition: { clientX, clientY },
      testID,
    })
}

function createMenu(menu: IMenu) {
  set(menu)
}

export async function closeMenu() {
  set(undefined)
}

// Export the store as readonly
export const menuStore = { subscribe }
