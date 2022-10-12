import { writable } from "svelte/store"

import type {
  IMenuArgumentItem,
  IMenuLocation,
  IOpenMenuArgument,
  ISubmenuArgumentItem,
} from "@/types/Types"
import type { StrictOmit } from "ts-essentials"

const { set, subscribe } = writable<
  | {
      readonly nodeOrPosition: IMenuLocation
      readonly items: readonly (IMenuArgumentItem | ISubmenuArgumentItem)[]
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

export function createOpenContextMenu({
  menuItems,
  testID,
}: StrictOmit<IOpenMenuArgument, "onEvent">): (node: HTMLElement) => {
  destroy: () => void
} {
  return (node: HTMLElement) => {
    // @ts-ignore TS wants this to take an `Event`, but I want it to take a PointerEvent.
    node.addEventListener("contextmenu", openContextMenu)

    return {
      destroy: () => {
        // @ts-ignore
        node.removeEventListener("contextmenu", openContextMenu)
      },
    }
  }
  function openContextMenu({ clientX, clientY }: PointerEvent) {
    set({ items: menuItems, nodeOrPosition: { clientX, clientY }, testID })
  }
}

export function closeMenu() {
  console.log("Close menu")

  set(undefined)
}

// Export the store as readonly
export const menuStore = { subscribe }
