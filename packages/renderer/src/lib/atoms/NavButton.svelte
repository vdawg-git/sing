<script lang="ts">
  import IconChevronLeft from "virtual:icons/heroicons-outline/chevron-left"
  import IconChevronRight from "virtual:icons/heroicons-outline/chevron-right"

  export let direction: "left" | "right"
  export let disabled = false
</script>

<button
  class="flex h-11 w-11  items-center justify-center rounded-full border border-solid border-grey-400/50 bg-grey-700/40 text-white shadow-lg backdrop-blur-md hover:bg-grey-800/50 hover:text-grey-100 active:bg-grey-900/60 active:text-grey-200 disabled:text-grey-300"
  {disabled}
  on:click
>
  {#if direction === "left"}
    <IconChevronLeft class="h-5 w-5" />
  {:else}
    <IconChevronRight class="h-5 w-5" />
  {/if}
</button>
