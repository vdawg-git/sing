<script lang="ts">
  import { TEST_IDS } from "@/TestConsts"
  import { isThisSourceCurrentPlayback, playFromTracklist } from "@/Helper"

  import TrackItem from "../molecules/TrackItem.svelte"
  import { currentPlayback, isShuffleOn } from "../manager/Player"

  import type { ITrack } from "@sing-types/DatabaseTypes"
  import type {
    ITrackListDisplayOptions,
    ICreateMenuOutOfTrack,
  } from "@/types/Types"
  import type { IPlaySource, TrackAndIndex } from "@sing-types/Types"

  export let tracks: readonly ITrack[]
  export let source: IPlaySource

  /**
   * Which colums should be displayed.
   * Defaults to showing all columns.
   */
  export let displayOptions: ITrackListDisplayOptions = {
    cover: true,
    album: true,
    artist: true,
  }
  export let createContextMenuItems: ICreateMenuOutOfTrack

  // TODO make display options generic. Maybe using a hashmap to generate the html (having the title always rendered)

  // TODO if track is playing, pause on click

  // TODO how to do the sorting for playlists?

  const usedDisplayOptions: ITrackListDisplayOptions = {
    cover: true,
    album: true,
    artist: true,
    ...displayOptions,
  }

  $: isCurrentPlayback = isThisSourceCurrentPlayback(source, $currentPlayback)

  function handlePlay({ track, index }: TrackAndIndex) {
    playFromTracklist(
      { source, firstTrack: track, index },
      isCurrentPlayback,
      $isShuffleOn
    )
  }
</script>

<div data-testid={TEST_IDS.trackList} class="flex w-full flex-col">
  <!-- Header -->
  <div
    class="flex w-full py-4 text-left text-xs font-medium uppercase text-grey-300"
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

  <!-- List -->
  <div class="trackList z-0 mb-14 w-full">
    {#each tracks as track, index}
      <TrackItem
        {track}
        displayOptions={usedDisplayOptions}
        {createContextMenuItems}
        on:dblclick={() => handlePlay({ index, track })}
      />
    {/each}
  </div>

  <!-- Add an empty element to allow for scrolling elements which are behind the playbar -->
  <div class="h-playbarPadded w-full" />
</div>
