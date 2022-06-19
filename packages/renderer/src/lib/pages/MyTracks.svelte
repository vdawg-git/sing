<script lang="ts">
  import TrackItem from "@/lib/molecules/TrackItem.svelte"
  import Settings from "@/lib/pages/Settings.svelte"
  import Tracks from "@/lib/stores/TracksStore"
  import player from "@/lib/manager/PlayerManager"
  import type { ISourceType } from "@/types/Types"
  import { TEST_IDS as id } from "@/TestConsts"

  const sourceType: ISourceType = "ALL_TRACKS"
</script>

<main
  class="
		flex h-full max-h-screen w-full 
		 content-start items-start justify-start overflow-auto
		overflow-x-clip"
>
  <div class="mx-auto mt-32 w-full max-w-[1560px] p-6 ">
    <h1 data-testid={id.myTracksTitle} class="mb-10 text-4xl">My Tracks</h1>
    {#await $Tracks}
      <p>...loading</p>
    {:then tracks}
      <div data-testid={id.pageTrackContent} class="w-full flex flex-col">
        {#if tracks.length === 0}
          <Settings />
        {:else}
          <div
            class="
              uppercase text-left text-xs text-grey-300 
              w-full flex py-4
            "
          >
            <div class="mr-6 flex flex-1 basis-44">
              <div class="w-16" />
              <div>Track</div>
            </div>
            <div class="mr-6 flex-1 basis-32">Artist</div>
            <div class="mr-6 flex-1 basis-32">Album</div>
            <div class="text-right flex-1 basis-12">Length</div>
          </div>
          <div class="w-full">
            {#each tracks as track, index}
              <TrackItem
                {track}
                on:dblclick={() =>
                  player.playSource(track, sourceType, tracks, index)}
              />
            {/each}
          </div>
          <!---- Add empty element to make allow scrolling elements behind playbar -->
          <div class=" h-24 w-full" />
        {/if}
      </div>
    {/await}
  </div>
</main>
