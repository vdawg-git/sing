<script lang="ts">
  import { isClickOutsideNode } from "../../Helper"
  import IconDotsVr from "virtual:icons/heroicons-outline/dots-vertical"
  import IconDotsHr from "virtual:icons/heroicons-outline/dots-horizontal"

  export let icon: "horizontal" | "vertical" = "vertical"
  export let open = false

  let iconButton: HTMLElement

  const iconClasses =
    "rounded-full w-8 h-8 p-1 text-grey-300 cursor-pointer hover:bg-grey-600 "

  function handleClick() {
    open = !open
  }

  function handleOutClick(node: HTMLElement) {
    const curriedOutClick = (event: MouseEvent) => {
      open = !(
        (
          isClickOutsideNode(event, node) &&
          isClickOutsideNode(event, iconButton)
        ) // If clicked on the icon button, this will return true. But the handleClick on the button closes the menu then. It works?
      )
    }
    document.addEventListener("click", curriedOutClick, true)

    return {
      destroy: () => {
        document.removeEventListener("click", curriedOutClick, true)
      },
    }
  }
</script>

<div class="z-50">
  <div on:click={handleClick} bind:this={iconButton}>
    {#if icon == "horizontal"}
      <IconDotsHr class={iconClasses} on:click={handleClick} />
    {:else}
      <IconDotsVr class={iconClasses} on:click={handleClick} />
    {/if}
  </div>
  {#if open}
    <div
      class="bg-grey-600 absolute rounded-lg min-w-[15rem] overflow-hidden"
      use:handleOutClick
      on:click={(_e) => (open = false)}
    >
      <slot>{console.error("Menu is empty x")}</slot>
    </div>
  {/if}
</div>
