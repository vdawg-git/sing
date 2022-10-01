<script lang="ts">
  import type { FilePath } from "@sing-types/Filesystem"
  import type { SvelteComponentDev } from "svelte/internal"
  import type { ISearchItemSubtext } from "@sing-types/Types"

  export let image: FilePath | undefined
  export let isImageCircle = false
  export let title: string
  export let label: string | undefined
  export let subtexts: readonly ISearchItemSubtext[]
  export let icon: typeof SvelteComponentDev

  // TODO fix navigatin from artist page to artist page: Currently not updating albums
  // TODO Fix title resizing in layout
</script>

<button
  class="
    group relative flex w-full cursor-pointer items-center
    justify-between gap-6 px-3 py-2
    hover:bg-grey-300/10
  "
  on:click
>
  <div class="flex max-w-[calc(100%-56px)] grow gap-3">
    <!---- Image -->
    {#if image}
      <img
        src={"file://" + image}
        class="h-12 w-12 {isImageCircle ? 'rounded-full' : 'rounded'}"
      />
    {:else}
      <div class="h-12 w-12 shrink-0 rounded bg-grey-700" />
    {/if}

    <!---- Meta -->
    <div class="flex max-w-[calc(100%-56px)] grow-0 flex-col align-middle">
      <!---- Title -->
      <div
        class="mb-0.5 overflow-hidden text-ellipsis whitespace-nowrap text-left text-base"
      >
        {title}
      </div>

      <!---- Second line text-->
      <div class="flex max-w-[100%-56px] items-center gap-2">
        <!---- Chip label -->
        {#if label}
          <div
            class="rounded bg-grey-500 px-1 py-1 text-xs2 uppercase text-grey-200"
          >
            {label}
          </div>
        {/if}

        <!---- Subtexts -->
        <div class="subtexts_">
          {#each subtexts as { label, onClick }, index}
            <div
              class="
                flex- min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-bold tracking-wide text-grey-200
               {onClick ? 'cursor-pointer hover:text-grey-300' : ''}
               {index === 0 ? 'shrink-[1] grow-[2]' : 'shrink-[2] grow-[1]'}
            "
              on:click={onClick}
            >
              {label}
            </div>
            {#if index !== subtexts.length - 1}
              <div class="text-sm font-bold text-grey-300">-</div>
            {/if}
          {/each}
        </div>
      </div>
    </div>
  </div>

  <!---- Icon -->
  <button class="shrink-0 grow-0">
    <svelte:component
      this={icon}
      class="mr-2 h-6 w-6 text-grey-300 group-hover:text-grey-200"
    />
  </button>
</button>

<style lang="postcss">
  .subtexts_ {
    width: max-content;
    max-width: 100%;
    display: grid;
    grid-auto-flow: column;
    grid-template-rows: minmax(0, 1fr);
    grid-auto-columns: minmax(0, minmax(min-content, 1fr)) min-content
      minmax(0, minmax(min-content, 1fr));
    grid-gap: 0.5rem;
  }
</style>
