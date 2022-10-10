<script lang="ts">
  import { TEST_ATTRIBUTES } from "@/TestConsts"
  import type { IMenuArgumentItem } from "@/types/Types"

  export let data: IMenuArgumentItem
</script>

<button on:click={data.onClick} data-testattribute={TEST_ATTRIBUTES.menuItem}>
  <div
    class="
      flex cursor-pointer items-center gap-3 p-3 align-middle hover:bg-grey-700 active:bg-grey-800
      "
  >
    {#if data.icon}
      <svelte:component
        this={data.icon}
        class="h-8 w-8 cursor-pointer p-1 text-grey-300 hover:bg-grey-600 "
      />
    {/if}
    <div class="">
      {data.label}
    </div>
  </div>
</button>
