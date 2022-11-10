<script lang="ts">
  import VirtualList from "svelte-tiny-virtual-list"
  import { createEventDispatcher } from "svelte"

  import type { ITrack } from "@sing-types/DatabaseTypes"
  import type { ISortOptions } from "@sing-types/Types"

  import type { ITestIDs } from "@/TestConsts"
  import type { ITrackListDisplayOptions } from "@/types/Types"
  import type { ICreateMenuOutOfMusic } from "@/Helper"

  import TrackItem from "../molecules/TrackItem.svelte"

  export let tracks: readonly ITrack[]
  export let testID: ITestIDs
  export let displayOptions: ITrackListDisplayOptions = {
    cover: true,
    album: true,
    artist: true,
  }
  export let sort: ISortOptions["tracks"] | ISortOptions["playlist"]
  export let createContextMenuItems: ICreateMenuOutOfMusic

  sort // Compiler dont cry for now

  // TODO make display options generic. Maybe using a hashmap to generate the html (having the title always rendered)

  // TODO if track is playing, pause on click

  // TODO how to do the sorting for playlists?

  const dispatch = createEventDispatcher<{
    play: { index: number }
  }>()

  const usedDisplayOptions: ITrackListDisplayOptions = {
    cover: true,
    album: true,
    artist: true,
    ...displayOptions,
  }

  let listHeight: number // Gets set by the virtual list within it, buit Typescript does not know it
  // let index: number // Gets set by the virtual list within it, buit Typescript does not know it

  function dispatchPlay(index: number) {
    dispatch("play", { index })
  }
</script>

<div class="flex w-full flex-col">
  <!---- Header -->
  <div
    class="
      flex w-full py-4 text-left text-xs
      font-medium uppercase text-grey-300
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

  <!---- List -->
  <div
    data-testid={testID}
    class="tracksList mb-14 w-full"
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
        {createContextMenuItems}
        on:dblclick={() => dispatchPlay(index)}
      />
    </VirtualList>
  </div>

  <!---- Add an empty element to allow for scrolling elements which are behind the playbar -->
  <div class="h-playbarPadded w-full" />
</div>

<style>
  .tracksList :global(.virtual-list-wrapper) {
    overflow: visible;
  }
</style>
