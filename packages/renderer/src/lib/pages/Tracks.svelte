<script lang="ts">
  import TrackItem from "@/lib/molecules/TrackItem.svelte"
  import Settings from "@/lib/pages/Settings.svelte"
  import player, { tracks } from "@/lib/manager/PlayerManager"
  import type { ISourceType } from "@/types/Types"
  import { TEST_IDS } from "@/TestConsts"

  const sourceType: ISourceType = "ALL_TRACKS"
</script>

<main
  class="
		flex h-full max-h-screen w-full 
		content-start items-start justify-start overflow-auto
		overflow-x-clip"
>
  <div class="mx-auto mt-32 w-full max-w-[1560px] p-6 ">
    <h1 data-testid={TEST_IDS.myTracksTitle} class="mb-10 text-4xl">
      Your Tracks
    </h1>
    {#await $tracks then allTracks}
      {#if allTracks.length === 0}
        <Settings />
      {:else}
        <div class="flex w-full flex-col">
          <div
            class="
                flex w-full py-4 text-left 
                text-xs uppercase text-grey-300
        "
          >
            <div class="mr-6 flex flex-1 basis-44">
              <div class="w-16" />
              <div>Track</div>
            </div>
            <div class="mr-6 flex-1 basis-32">Artist</div>
            <div class="mr-6 flex-1 basis-32">Album</div>
            <div class="flex-1 basis-12 text-right">Length</div>
          </div>
          <div data-testid={TEST_IDS.trackItems} class="w-full">
            {#each allTracks as track, index}
              <TrackItem
                {track}
                on:dblclick={() =>
                  player.playSource(track, sourceType, allTracks, index)}
              />
            {/each}
          </div>
          <!---- Add empty element to make allow scrolling elements behind playbar -->
          <div class=" h-24 w-full" />
        </div>
      {/if}
    {/await}
  </div>
</main>
