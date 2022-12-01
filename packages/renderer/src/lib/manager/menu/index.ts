import { writable } from "svelte/store"

import type {
  IMenuItemsArgument,
  IMenuLocation,
  IOpenMenuArgument,
} from "@/types/Types"
import type { StrictOmit } from "ts-essentials"

const { set, subscribe } = writable<
  | {
      readonly nodeOrPosition: IMenuLocation
      readonly items: IMenuItemsArgument
      readonly testID?: string
    }
  | undefined
>()

/**
 * Create an use-directive action to open a menu.
 * By default it opens on:click of the element.
 * @return A function to be used with the `use` directive.
 */
export function createOpenMenu({
  menuItems,
  onEvent,
  testID,
}: IOpenMenuArgument): (node: HTMLElement) => { destroy: () => void } {
  return (node: HTMLElement) => {
    node.addEventListener(onEvent ?? "click", openMenu)

    return {
      destroy: () => {
        node.removeEventListener(onEvent ?? "click", openMenu)
      },
    }

    function openMenu() {
      set({
        items: menuItems,
        nodeOrPosition: node,
        testID,
      })
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
    set({ items: menuItems, nodeOrPosition: { clientX, clientY }, testID })
}

export async function closeMenu() {
  set(undefined)
}

// Export the store as readonly
export const menuStore = { subscribe }
