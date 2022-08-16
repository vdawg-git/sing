<script lang="ts">
  import Settings from "@/lib/pages/Settings.svelte"
  import player, { albums } from "@/lib/manager/PlayerManager"
  import type { ISourceType } from "@/types/Types"
  import { TEST_IDS } from "@/TestConsts"
  import AlbumCard from "../molecules/AlbumCard.svelte"

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
      Your Albums
    </h1>
    {#await $albums then allAlbums}
      {#if allAlbums.length === 0}
        <Settings />
      {:else}
        <div class="flex w-full flex-wrap gap-6">
          {#each allAlbums as album, index}
            <AlbumCard {album} />
          {/each}

          <div class=" h-24 w-full" />
        </div>
      {/if}
    {/await}
  </div>
</main>
