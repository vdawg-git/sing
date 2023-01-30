<script lang="ts">
  import IconArrowLeft from "virtual:icons/heroicons/arrow-left"
  import { fade, fly } from "svelte/transition"
  import { sineInOut } from "svelte/easing"

  import { TEST_IDS } from "@/TestConsts"

  import {
    useCallbacks,
    useDisableScrolling,
    useOnOutClick,
  } from "../../../Helper"
  import MenuItem from "../../atoms/MenuItem.svelte"

  import { calculatePosition, createMenu } from "./MenuHelper"
  import MenuSeperator from "./MenuSeperator.svelte"

  import { menuStore, closeMenu, menuElementID } from "./index"

  import type { Coords } from "@floating-ui/dom"

  // TODO enable scroll lock while menu is opened.

  /**
   * The element which wraps the menu and is always in the dom (unlike the actual menu).
   * Used to be referenced by other code.
   */

  let menuID: "main" | symbol = "main"

  // How long does the menu take to resize. Update this also in the CSS down below.
  const animationSlideDuration = 200
  const animantionSizeDuration = 140

  /**
   * Unanimated invisible video, used to retrieve width and height data from
   */
  let referenceMenuElement: HTMLElement

  let activeMenuElement: HTMLElement

  let menuX: number
  let menuY: number

  /**
   * Is the menu just being created.
   * Will be false after the it has been created.
   * Used to determine if animations, for example sliding, are enabled.
   * As it should not slide on the first level, the "main", when opened.
   */
  let isJustOpened = true

  // In which direction should it animate. Slide in or out
  let isGoingBack = false

  $: menus = createMenu($menuStore?.items ?? [], setMenuID, closeMenu)
  $: activeMenu = menus.find(({ id }) => id === menuID)
  $: itemsToShow = activeMenu?.items ?? []

  $: {
    // When the menu is closed or another one opens, reset to the default main state
    if ($menuStore) {
      menuID = "main"
      isJustOpened = true
    }
  }

  $: {
    if (activeMenuElement === null) {
      // Fixes issue of menu getting nulled from the outro animation.
      // I dont know why its getting nulled though.
      // To recreate, delete the next line and click on a sub menu item. Then open the submenu again.
      activeMenuElement = document.querySelector("#menu") as HTMLElement
    }
  }

  $: {
    // (Re)- caculate the postion when the store is opened
    if (referenceMenuElement && $menuStore && menuID) {
      calculatePosition({
        nodeOrPosition: $menuStore.nodeOrPosition,
        menuElement: referenceMenuElement,
        isFlipping: menuID === "main" ? true : false,
      }).then(handleMenuOpened)
    }
  }

  $: activeMenuHeight = activeMenuElement?.scrollHeight ?? 0
  $: activeMenuWidth = activeMenuElement?.scrollWidth
    ? Math.min(560, Math.max(activeMenuElement.scrollWidth, 240))
    : 240

  // This is used to invert the animation direction when going back from a submenu. It simply gets overriden.
  // Then we make the animation go to the normal direction again when going into a submenu.
  // eslint-disable-next-line func-style, @typescript-eslint/no-empty-function
  let onSlideIntroStart = () => {}

  // Slide the full menu when going into a submenu, but dont animate when you just opened a menu.
  $: animationValue = isJustOpened ? 0 : activeMenuWidth

  async function goBack() {
    isGoingBack = true
    menuID = activeMenu?.previousMenu ?? "main"

    onSlideIntroStart = () => {
      isGoingBack = false
    }
  }

  function setMenuID(id: "main" | symbol) {
    // Set the height of the menu to auto, so that it can animate to the new sub menu height
    if (activeMenuElement?.style) {
      activeMenuElement.style.height = "auto"
    }
    menuID = id
  }

  function handleMenuOpened(coordinates: Coords) {
    setXY(coordinates)

    setTimeout(() => {
      isJustOpened = false
    }, animantionSizeDuration)
  }

  function setXY(coordinates: Coords) {
    menuX = coordinates.x
    menuY = coordinates.y
  }
</script>

<!--
  @component

  The element which renders the active menu.
  
  As there can only be one active menu, having only one managing component is enough.
-->

<!-- A wrapper to be referenced by code -->
<div class="absolute" id={menuElementID}>
  <!-- The menu -->
  {#key $menuStore}
    {#if activeMenu !== undefined && activeMenu?.items.length !== 0}
      <!-- The displayed menu -->
      <div
        data-testID={$menuStore?.testID ?? TEST_IDS.menu}
        class=" _main fixed z-50 h-[256px] max-h-[400px] min-w-[15rem] overflow-hidden rounded-lg border border-grey-400/50 bg-grey-600 shadow-2xl duration-[400ms]"
        style:height={`${activeMenuHeight}px`}
        style:left={`${menuX}px`}
        style:top={`${menuY}px`}
        style:width={`${activeMenuWidth}px`}
        style:transition-property={isJustOpened
          ? "none"
          : "width, height, left, top"}
        use:useOnOutClick={{
          callback: closeMenu,
          extraElements: $menuStore?.triggerElement,
        }}
        use:useDisableScrolling
        use:useCallbacks={{
          onMount: $menuStore?.onCreate,
          onDestroy: $menuStore?.onDestroy,
        }}
        in:fade={{ duration: 120 }}
      >
        {#key activeMenu}
          <!---- Menu inner -->
          <div
            class="absolute top-0 left-0 flex w-max min-w-[240px] flex-col"
            in:fly|local={{
              x: animationValue * (isGoingBack ? -1 : 1),
              duration: animationSlideDuration,
              easing: sineInOut,
            }}
            out:fly|local={{
              x: animationValue * (isGoingBack ? 1 : -1),
              duration: animationSlideDuration,
              easing: sineInOut,
            }}
            bind:this={activeMenuElement}
            id="menu"
            on:introstart={onSlideIntroStart}
          >
            <!---- Menu title + back button -->
            {#if activeMenu.id !== "main"}
              <div
                class="flex items-center gap-3 py-3 pl-2 pr-6 text-lg font-medium"
              >
                <button
                  class="p-1hover:bg-grey-500 rounded-full"
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
            <div
              class="flex max-h-[400px] flex-col overflow-y-auto overflow-x-hidden "
            >
              {#each itemsToShow as item}
                {#if item.type === "item"}
                  <MenuItem data={item} />
                {:else if item.type === "spacer"}
                  <MenuSeperator />
                {/if}
              {/each}
            </div>
          </div>
        {/key}
      </div>

      <!-- 
      Menu reference element. 
      This one does not animate and thus delivers accurate values to the calculatePosition function. 

      Plus 4 to the height because otherwise the bottom gets cut off by this amount for some reason.
    --->
      <div
        bind:this={referenceMenuElement}
        class="fixed"
        style:left={`${menuX}px`}
        style:right={`${menuY}px`}
        style:height={`${activeMenuHeight + 4}px`}
        style:width={`${activeMenuWidth}px`}
      />
    {/if}
  {/key}
</div>

<style>
  ._main {
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
</style>
