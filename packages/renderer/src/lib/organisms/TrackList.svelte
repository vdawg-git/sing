<script lang="ts">
  import player from "@/lib/manager/player/index"
  import TrackItem from "../molecules/TrackItem.svelte"
  import VirtualList from "svelte-tiny-virtual-list"

  import type { ITestIDs } from "@/TestConsts"
  import type { ITrack } from "@sing-types/Types"
  import type { ISourceType, ITrackListDisplayOptions } from "@/types/Types"

  export let tracks: readonly ITrack[]
  export let testID: ITestIDs
  export let sourceType: ISourceType
  export let displayOptions: ITrackListDisplayOptions = {
    cover: true,
    album: true,
    artist: true,
  }

  const usedDisplayOptions: ITrackListDisplayOptions = {
    cover: true,
    album: true,
    artist: true,
    ...displayOptions,
  }

  let listHeight: number
  let index: number // Typescript dont cry
</script>

<div class="flex w-full  flex-col">
  <div
    class="
      flex w-full py-4 text-left 
      text-xs uppercase text-grey-300
      "
  >
    <div class="mr-6 flex flex-1 basis-44">
      {#if usedDisplayOptions.cover}
        <div class="w-16" />{/if}
      <div>Track</div>
    </div>
    {#if usedDisplayOptions.artist}
      <div class="mr-6 flex-1 basis-32">Artist</div>{/if}
    {#if usedDisplayOptions.album}
      <div class="mr-6 flex-1 basis-32">Album</div>{/if}
    <div class="flex-1 grow-0 basis-12 text-right">Length</div>
  </div>
  <div
    data-testid={testID}
    class="tracksList w-full"
    bind:clientHeight={listHeight}
  >
    <VirtualList
      width="100%"
      height={listHeight}
      itemCount={tracks.length}
      itemSize={64}
    >
      <TrackItem
        slot="item"
        let:index
        track={tracks[index]}
        displayOptions={usedDisplayOptions}
        on:dblclick={() => {
          player.playSource(tracks[index], sourceType, tracks, index)
        }}
      />
    </VirtualList>
  </div>
  <!---- Add an empty element to allow for scrolling elements which are behind the playbar -->
  <div class=" h-24 w-full" />
</div>

<style>
  .tracksList :global(.virtual-list-wrapper) {
    overflow: visible;
  }
</style>
