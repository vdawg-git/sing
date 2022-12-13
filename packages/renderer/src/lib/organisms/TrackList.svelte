<script lang="ts">
  import { createEventDispatcher } from "svelte"

  import TrackItem from "../molecules/TrackItem.svelte"

  import type { ITrack } from "@sing-types/DatabaseTypes"
  import type { ISortOptions } from "@sing-types/Types"
  import type { ITestIDs } from "@/TestConsts"
  import type {
    ITrackListDisplayOptions,
    ICreateMenuOutOfTrack,
  } from "@/types/Types"

  export let tracks: readonly ITrack[]
  export let testID: ITestIDs

  /**
   * Which colums should be displayed.
   * Defaults to showing all columns.
   */
  export let displayOptions: ITrackListDisplayOptions = {
    cover: true,
    album: true,
    artist: true,
  }
  export let sort: ISortOptions["tracks"] | ISortOptions["playlist"]
  export let createContextMenuItems: ICreateMenuOutOfTrack

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
      {#if usedDisplayOptions.cover || usedDisplayOptions.cover === undefined}
        <div class="w-16" />{/if}
      <div>Track</div>
    </div>
    {#if usedDisplayOptions.artist || usedDisplayOptions.artist === undefined}
      <div class="mr-6 flex-1 basis-32">Artist</div>{/if}
    {#if usedDisplayOptions.album || usedDisplayOptions.album === undefined}
      <div class="mr-6 flex-1 basis-32">Album</div>{/if}
    <div class="flex-1 grow-0 basis-12 text-right">Length</div>
  </div>

  <!---- List -->
  <div
    data-testid={testID}
    class="tracksList z-0 mb-14 w-full"
    bind:clientHeight={listHeight}
  >
    {#each tracks as track, index}
      <TrackItem
        {track}
        displayOptions={usedDisplayOptions}
        {createContextMenuItems}
        on:dblclick={() => dispatchPlay(index)}
      />
    {/each}
  </div>

  <!---- Add an empty element to allow for scrolling elements which are behind the playbar -->
  <div class="h-playbarPadded w-full" />
</div>

<style>
  .tracksList :global(.virtual-list-wrapper) {
    overflow: visible;
  }
</style>
