<script lang="ts">
  import type { ITrack } from "@sing-types/Types"
  import { displayMetadata, secondsToDuration, titleToDisplay } from "@/Helper"
  export let track!: ITrack
</script>

<main
  class="
    group relative  z-10  flex w-full cursor-pointer auto-cols-[1fr] items-center
  "
  on:click
  on:dblclick
>
  <!---- Cover and Title -->
  <div class="mr-6 min-w-0 flex-1 basis-44 py-2">
    <div class="flex min-w-0 items-center">
      {#if track.coverPath}
        <img
          src="file://{track.coverPath}"
          alt="Cover of {track?.title || track.filepath.split('/').at(-1)}"
          class="mr-4 h-12 w-12 shrink-0 grow-0 rounded"
        />
      {:else}
        <div
          class="mr-4 h-12 w-12 shrink-0 grow-0 rounded bg-gradient-to-br from-grey-600 to-grey-700"
        />
      {/if}
      <div
        class=" min-w-0  flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
      >
        {displayMetadata("title", track)}
      </div>
    </div>
  </div>

  <!---- Artist -->
  <div
    class="mr-6 flex-1 basis-32  overflow-hidden text-ellipsis whitespace-nowrap align-middle"
  >
    {displayMetadata("artist", track)}
  </div>

  <!---- Album -->
  <div
    class="mr-6 flex-1 basis-32 overflow-hidden  text-ellipsis whitespace-nowrap align-middle"
  >
    {displayMetadata("album", track)}
  </div>

  <!---- Duration -->
  <div
    class="flex-1  basis-12 overflow-hidden text-ellipsis whitespace-nowrap text-right align-middle"
  >
    {displayMetadata("duration", track)}
  </div>

  <!---- Hover bg -->
  <div
    class="w-[calc(100% + 2rem)] absolute inset-0 -z-10 -ml-4 -mr-4 h-full  rounded-xl group-hover:bg-grey-700 group-active:bg-grey-600"
  />
</main>

<style lang="postcss">
  /* .contain {
    contain: strict;
  } */
</style>
