<script lang="ts">
  import IconArrowLeft from "virtual:icons/heroicons/arrow-left"
  import {
    fade,
    fly,
    type FlyParams,
    type TransitionConfig,
  } from "svelte/transition"
  import { sineInOut } from "svelte/easing"

  import { createOnOutClick } from "../../../Helper"
  import MenuItem from "../../atoms/MenuItem.svelte"

  import { calculatePosition, createMenu } from "./MenuHelper"
  import MenuSeperator from "./MenuSeperator.svelte"

  import { menuStore, closeMenu } from "./index"

  import type { Coords } from "@floating-ui/dom"

  // TODO fix no shifting when nessecary after submenu opens
  // This could probably be accomplished by enabling shifting on each sub-menu opening.
  // And saving an array of coordinates of each submenu after shifting and if the new coordinates of the menu match one of the already saved, simpy dont shift, as a new shift will be further away from the screen edge and not closer, so iit always stays as far away as possible and needed

  // TODO enable scroll lock while menu is opened.

  let menuID: "main" | symbol = "main"

  // How long does the menu take to resize. Update this also in the CSS down below.
  const animationSlideDuration = 320
  const animantionSizeDuration = 140

  let menuElement: HTMLElement
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
    // (Re)- caculate the postion when the store is opened
    if (menuElement && $menuStore && menuID) {
      calculatePosition({
        nodeOrPosition: $menuStore.nodeOrPosition,
        menuElement,
        isFlipping: menuID === "main" ? true : false,
      }).then(handleMenuOpened)
    }
  }

  const onOutClick = createOnOutClick(closeMenu)

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

  function conditionalFly(
    node: HTMLElement,
    options: FlyParams & { isInAnimation: boolean }
  ): TransitionConfig {
    // For whatever reason the node gets nulled if the duration is too short. Even with a normal fly animation, it just gets nulled. This fixes it *mostly*.
    // Furthermore, the `options.in` gets used to hide the old transititioning element, visually disabling the animation.
    // Hopefully there is be a better way to do this.

    if (isJustOpened)
      return {
        duration: animationSlideDuration + 200,
        css: () =>
          `display: none; opacity: ${options.isInAnimation ? 1 : 0};  
          ${options.isInAnimation ? "" : "pointer-events: none;"}
          `,
      }

    return fly(node, options)
  }
</script>

{#key $menuStore}
  {#if activeMenu !== undefined && activeMenu?.items.length !== 0}
    <!-- The displayed menu -->
    <!-- For some reason a fade-in prevents the unmounting of the old menu (very visible when the menu completely changes) -->
    <div
      data-testID={$menuStore?.testID}
      class=" _main fixed z-50 h-[256px] max-h-[400px] min-w-[15rem] overflow-hidden rounded-lg border border-grey-400/50 bg-grey-600 shadow-2xl"
      style="
        left: {menuX}px;
        top: {menuY}px; 
        height: {activeMenuHeight}px; 
        width: {activeMenuWidth}px;
        transition-duration: 400ms;
        transition-property: {isJustOpened
        ? 'none'
        : 'width, height, left, top'};"
      in:fade={{ duration: 140 }}
      use:onOutClick
    >
      <!---- Menu Content -->
      {#key activeMenu}
        <div
          class="absolute top-0 left-0 flex w-max min-w-[240px] flex-col"
          in:conditionalFly|local={{
            x: animationValue * (isGoingBack ? -1 : 1),
            duration: animationSlideDuration,
            easing: sineInOut,
            isInAnimation: true,
          }}
          out:conditionalFly|local={{
            x: animationValue * (isGoingBack ? 1 : -1),
            duration: animationSlideDuration,
            easing: sineInOut,
            isInAnimation: false,
          }}
          bind:this={activeMenuElement}
          on:introstart={onSlideIntroStart}
        >
          <!---- Menu title + back button -->
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
      bind:this={menuElement}
      class="fixed"
      style="
      left: {menuX}px ;top: {menuY}px; 
      height: {activeMenuHeight + 4}px; width: {activeMenuWidth}px;"
    />
  {/if}
{/key}

<style>
  ._main {
    transition-property: left, top, width, height;
    transition-duration: 140ms;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
</style>
