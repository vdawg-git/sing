<script lang="ts">
  import TrackItem from "../molecules/trackItem.svelte"
  import NoContent from "../organisms/NoContent.svelte"
  import Tracks from "@/lib/stores/TracksStore"
  import player from "../manager/PlayerManager"
  import type { ISourceType } from "@/types/Types"

  const sourceType: ISourceType = "ALL_TRACKS"
</script>

<main
  class="
		flex h-screen max-h-screen w-full 
		 content-start items-start justify-start overflow-auto
		overflow-x-clip sm:ml-2 md:ml-6 lg:ml-10"
>
  <div class="mx-auto mt-32 w-full max-w-[1560px] p-6 ">
    <h1 class="mb-10 text-4xl  ">My Tracks</h1>
    {#await $Tracks}
      <p>...loading</p>
    {:then tracks}
      {#if tracks.length === 0}
        <NoContent />
      {:else}
        <div class="w-full  table border-collapse">
          <div
            class="table-header-group uppercase text-left  text-xs text-grey-300"
          >
            <div class="table-cell p-4 pl-16 pb-6">Track</div>
            <div class="table-cell p-4 pl-2 ">Artist</div>
            <div class="table-cell p-4 pl-2">Album</div>
            <div class="table-cell p-4 pr-0 text-right">Length</div>
          </div>
          <div class="table-row-group">
            {#each tracks as track, index}
              <TrackItem
                {track}
                on:dblclick={() =>
                  player.playSource(track, sourceType, tracks, index)}
              />
            {/each}
          </div>
          <!---- Add empty element to make allow scrolling elements behind playbar -->
          <div class="table-row-group h-24" />
        </div>
      {/if}
    {/await}
  </div>
</main>
