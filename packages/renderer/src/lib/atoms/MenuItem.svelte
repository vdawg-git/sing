<script lang="ts">
  import type { IRoutes } from "@/Consts"
  import { TEST_ATTRIBUTES } from "@/TestConsts"
  import { Link } from "svelte-navigator"

  export let to: IRoutes | undefined = undefined
</script>

{#if to}
  <Link {to} data-testattribute={TEST_ATTRIBUTES.menuItem}>
    <div
      class="
      flex cursor-pointer p-3 align-middle active:bg-grey-500
      "
    >
      <slot name="icon" />
      <slot name="label">No Text provided</slot>
    </div>
  </Link>
{:else}
  <button on:click data-testattribute={TEST_ATTRIBUTES.menuItem}>
    <div
      class="
      flex cursor-pointer p-3 align-middle active:bg-grey-500
      "
    >
      <slot name="icon" />
      <slot name="label">No Text provided</slot>
    </div>
  </button>
{/if}
