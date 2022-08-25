<script lang="ts">
  import { displayMetadata } from "@/Helper"
  import { TEST_ATTRIBUTES } from "@/TestConsts"
  import type { ITrackListDisplayOptions } from "@/types/Types"

  import type { ITrack } from "@sing-types/Types"

  export let track!: ITrack
  export let displayOptions: ITrackListDisplayOptions
</script>

<div
  data-testattribute={TEST_ATTRIBUTES.trackItem}
  class="
    group relative  z-10  flex h-16 w-full cursor-pointer auto-cols-[1fr] items-center
    overflow-visible
  "
  on:dblclick
>
  <!---- Cover and Title -->
  <div class="mr-6 min-w-0 flex-1 basis-44 py-2">
    <div class="flex min-w-0 items-center">
      {#if displayOptions.cover}
        {#if track?.coverPath}
          <img
            data-testattribute={TEST_ATTRIBUTES.trackItemCover}
            src="file://{track.coverPath}"
            alt="Cover of {track?.title || track.filepath.split('/').at(-1)}"
            class="mr-4 h-12 w-12 shrink-0 grow-0 rounded"
          />
        {:else}
          <div
            data-testattribute={TEST_ATTRIBUTES.trackItemCover}
            class="mr-4 h-12 w-12 shrink-0 grow-0 rounded bg-gradient-to-br from-grey-600 to-grey-700"
          />
        {/if}
      {/if}
      <div
        data-testattribute={TEST_ATTRIBUTES.trackItemTitle}
        class=" min-w-0  flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
      >
        {displayMetadata("title", track)}
      </div>
    </div>
  </div>

  <!---- Artist -->
  {#if displayOptions.artist}
    <div
      data-testattribute={TEST_ATTRIBUTES.trackItemArtist}
      class="mr-6 flex-1 basis-32  overflow-hidden text-ellipsis whitespace-nowrap align-middle"
    >
      {displayMetadata("artistName", track)}
    </div>
  {/if}

  <!---- Album -->
  {#if displayOptions.album}
    <div
      data-testattribute={TEST_ATTRIBUTES.trackItemAlbum}
      class="mr-6 flex-1 basis-32 overflow-hidden  text-ellipsis whitespace-nowrap align-middle"
    >
      {displayMetadata("albumName", track)}
    </div>
  {/if}

  <!---- Duration -->
  <div
    data-testattribute={TEST_ATTRIBUTES.trackItemDuration}
    class="flex-1 grow-0 basis-12 overflow-hidden text-ellipsis whitespace-nowrap text-right align-middle"
  >
    {displayMetadata("duration", track)}
  </div>

  <!---- Hover bg -->
  <div
    class="w-[calc(100% + 2rem)] group-active:bg-grey-60 absolute inset-0 -z-10 -ml-4  -mr-4 h-full  rounded-xl group-hover:bg-grey-700"
  />
</div>

<style lang="postcss">
  /* .contain {
    contain: strict;
  } */
</style>
