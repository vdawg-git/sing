<script lang="ts">
  import type { FilePath } from "@sing-types/Filesystem"
  import type { SvelteComponentDev } from "svelte/internal"
  import type { ISubtext } from "@sing-types/Types"

  export let image: FilePath | undefined
  export let isImageCircle = false
  export let title: string
  export let label: string | undefined
  export let subtexts: ISubtext[]
  export let icon: typeof SvelteComponentDev
</script>

<main
  class="
    group relative flex w-full cursor-pointer items-center
    justify-between gap-6
  "
  on:click
>
  <div class="flex grow gap-3">
    {#if image}
      <img
        src={"file://" + image}
        class="h-12 w-12 {isImageCircle ? 'rounded-full' : 'rounded'}"
      />
    {:else}
      <div class="h-12 w-12 shrink-0 rounded bg-grey-700" />
    {/if}

    <div class="grid grow-0 grid-flow-row items-center">
      <span class="overflow-hidden text-ellipsis whitespace-nowrap text-base">
        {title}
      </span>
      {#if label}
        <div class="bg-grey-500 text-xs2 text-grey-200">{label}</div>
      {/if}
      {#each subtexts as { label, onClick }}
        <span
          class="-mt-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-bold text-grey-300"
          on:click={onClick}
        >
          {label}
        </span>
      {/each}
    </div>
  </div>
  <button class="shrink-0 grow-0">
    <svelte:component
      this={icon}
      class="mr-2 h-6 w-6 text-grey-300 hover:text-white"
    />
  </button>
  <div
    class="absolute inset-[-0.5rem] left-[-0.55rem] -z-10 rounded-xl  group-hover:bg-grey-300/10 "
  />
</main>
