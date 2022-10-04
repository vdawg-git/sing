<script lang="ts">
  import { createOnOutClick, isClickOutsideNode } from "../../Helper"
  import IconDotsVr from "virtual:icons/heroicons-outline/dots-vertical"
  import IconDotsHr from "virtual:icons/heroicons-outline/dots-horizontal"

  export let icon: "horizontal" | "vertical" = "vertical"
  export let open = false
  export let menuTestID: string
  export let iconTestID: string

  const iconClasses =
    "rounded-full w-8 h-8 p-1 text-grey-300 cursor-pointer hover:bg-grey-600 "

  function handleClick() {
    if (open) return
    open = true
  }

  function handleOnOutClick() {
    open = !open
  }

  const onOutClick = createOnOutClick(handleOnOutClick)
</script>

<div class="">
  <button data-testID={iconTestID} on:click={handleClick}>
    {#if icon == "horizontal"}
      <IconDotsHr class={iconClasses} />
    {:else}
      <IconDotsVr class={iconClasses} />
    {/if}
  </button>

  {#if open}
    <div
      data-testID={menuTestID}
      class="absolute z-50 min-w-[15rem] overflow-hidden rounded-lg bg-grey-600"
      use:onOutClick
      on:click={() => (open = false)}
    >
      <slot>
        Menu is empty
        {console.error("Menu is empty x")}
      </slot>
    </div>
  {/if}
</div>
