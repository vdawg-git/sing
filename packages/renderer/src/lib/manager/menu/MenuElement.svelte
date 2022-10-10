<script lang="ts">
  import { platform } from "@floating-ui/dom"
  import { computePosition, flip, shift, offset } from "@floating-ui/dom"
  import { createOnOutClick } from "../../../Helper"
  import MenuItem from "../../atoms/MenuItem.svelte"
  import { createMenu } from "./MenuHelper"
  import { menuStore, closeMenu } from "./index"

  import type { IMenuArgumentItem } from "@/types/Types"

  let menuID: "main" | symbol = "main"

  $: menus = createMenu($menuStore?.items ?? [], setMenuID)
  $: activeMenu = menus.find(({ id }) => id === menuID)
  $: itemsToShow = activeMenu?.items ?? []

  let x: number
  let y: number

  $: {
    if (menuElement && $menuStore) {
      // Its a HTML element to which the menu should be attached
      if ("addEventListener" in $menuStore?.nodeOrPosition) {
        computePosition($menuStore.nodeOrPosition, menuElement, {
          platform,
          placement: "bottom",
          middleware: [offset(4), flip(), shift({ padding: 4 })],
        }).then(setXY)
      }

      // Its the position of the context menu
      else if ("clientX" in $menuStore.nodeOrPosition) {
        const { clientX, clientY } = $menuStore.nodeOrPosition

        // Use a fake element as the reference for the position of the context menu
        const fakeHTMLElement = {
          clientHeight: 1,
          clientWidth: 1,
          clientLeft: x,
          clientTop: y,
          getBoundingClientRect: () => ({
            x: clientX,
            y: clientY,
            top: clientY,
            bottom: 0,
            left: clientX,
            right: 0,
            width: 1,
            height: 1,
          }),
        }

        computePosition(fakeHTMLElement, menuElement, {
          placement: "bottom-end",
          middleware: [offset(4), flip(), shift({ padding: 4 })],
        }).then(setXY)
      }
    }
  }

  const onOutClick = createOnOutClick(closeMenu)

  let menuElement: HTMLElement

  function setMenuID(id: "main" | symbol) {
    menuID = id
  }

  function setXY(coordinates: { x: number; y: number }) {
    x = coordinates.x
    y = coordinates.y
  }
</script>

{#if activeMenu !== undefined && activeMenu?.items.length !== 0}
  <div
    data-testID={$menuStore?.testID}
    class="absolute z-50 flex min-w-[15rem] flex-col overflow-hidden rounded-lg border border-grey-400/50 bg-grey-600"
    style="left: {x}px ;top: {y}px;"
    use:onOutClick
    bind:this={menuElement}
  >
    {#if activeMenu.id !== "main"}
      <div class="flex">
        {activeMenu.title}
      </div>
    {/if}
    {#each itemsToShow as item}
      <MenuItem data={item} />
    {/each}
  </div>
{/if}
