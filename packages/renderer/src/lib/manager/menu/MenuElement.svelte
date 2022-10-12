<script lang="ts">
  import { createOnOutClick } from "../../../Helper"
  import MenuItem from "../../atoms/MenuItem.svelte"
  import { calculatePosition, createMenu } from "./MenuHelper"
  import { menuStore, closeMenu } from "./index"
  import IconArrowLeft from "virtual:icons/heroicons/arrow-left"
  import { fly } from "svelte/transition"
  import { sineInOut } from "svelte/easing"

  import type { Coords } from "@floating-ui/dom"

  // TODO fix no shifting when nessecary after submenu opens

  let menuID: "main" | symbol = "main"

  /**
   * Used to determine if animations are enabled
   */
  let hasFinishedOpeneing = false

  $: menus = createMenu($menuStore?.items ?? [], setMenuID, closeMenu)
  $: activeMenu = menus.find(({ id }) => id === menuID)
  $: itemsToShow = activeMenu?.items ?? []

  $: {
    // When the menu is closed or changes, reset to the default main state
    if ($menuStore) {
      menuID = "main"
      hasFinishedOpeneing = false
    }
  }

  let x: number
  let y: number

  $: {
    // (Re)- caculate the postion when the store is opened or a submenu is selected
    if (menuElement && $menuStore) {
      calculatePosition($menuStore.nodeOrPosition, menuElement).then(
        handleMenuOpened
      )
    }
  }

  const onOutClick = createOnOutClick(closeMenu)

  let menuElement: HTMLElement

  let activeMenuElement: HTMLElement

  let isGoingBack = false

  $: activeMenuHeight = activeMenuElement?.scrollHeight ?? 0
  $: activeMenuWidth = activeMenuElement?.scrollWidth
    ? Math.min(560, Math.max(activeMenuElement.scrollWidth, 240))
    : 240

  $: {
    console.log({ width: activeMenuElement?.scrollWidth, activeMenuWidth })
  }

  // Make the animation when going back go to the right direction.
  // And revert it, so the animation going forward works.
  let introStart = () => {}

  $: xAnimationValue = hasFinishedOpeneing ? activeMenuWidth : 0

  async function goBack() {
    isGoingBack = true
    menuID = activeMenu?.previousMenu ?? "main"

    introStart = () => {
      isGoingBack = false
    }
  }

  function setMenuID(id: "main" | symbol) {
    if (activeMenuElement?.style) {
      activeMenuElement.style.height = "auto"
    }
    menuID = id
  }

  function handleMenuOpened(coordinates: Coords) {
    // Set it to open state after a short delay so that it wont animate the position when opening.
    hasFinishedOpeneing = false
    setXY(coordinates)

    setTimeout(() => {
      hasFinishedOpeneing = true
    }, 100)
  }

  function setXY(coordinates: Coords) {
    x = coordinates.x
    y = coordinates.y

    console.log({ x, y })
  }
</script>

{#if activeMenu !== undefined && activeMenu?.items.length !== 0}
  <div
    data-testID={$menuStore?.testID}
    class="_transition absolute  z-50 h-[256px] min-w-[15rem] overflow-hidden rounded-lg border border-grey-400/50 bg-grey-600 shadow-2xl"
    style="
      left: {x}px ;top: {y}px; 
      height: {activeMenuHeight}px; width: {activeMenuWidth}px;
      transition-duration: 140ms;
      transition-property: {hasFinishedOpeneing
      ? 'width, height, left, top'
      : 'none'};"
    use:onOutClick
    bind:this={menuElement}
  >
    <!---- Menu Content -->
    {#key activeMenu}
      <div
        class="absolute top-0 left-0 flex w-max min-w-[240px] flex-col"
        in:fly|local={{
          x: xAnimationValue * (isGoingBack ? -1 : 1),
          duration: 290,
          opacity: -0.5,
          easing: sineInOut,
        }}
        out:fly|local={{
          x: xAnimationValue * (isGoingBack ? 1 : -1),
          duration: 290,
          opacity: -0.5,
          easing: sineInOut,
        }}
        bind:this={activeMenuElement}
        on:introstart={introStart}
      >
        <!---- Menu title + back button-->
        {#if activeMenu.id !== "main"}
          <div
            class="flex items-center gap-3 py-3 pl-2 pr-6 text-lg font-medium"
          >
            <button
              class="rounded-full p-1  hover:bg-grey-500"
              on:click={goBack}
            >
              <IconArrowLeft class="h-6 w-6 text-grey-300" />
            </button>
            <div class="text-white">
              {activeMenu.title}
            </div>
          </div>
        {/if}

        <!---- Menu items -->
        {#each itemsToShow as item}
          <MenuItem data={item} />
        {/each}
      </div>
    {/key}
  </div>
{/if}

<style>
</style>
