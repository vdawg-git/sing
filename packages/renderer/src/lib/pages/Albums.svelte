<script lang="ts">
  import { useNavigate } from "svelte-navigator"
  import player, { albums } from "@/lib/manager/player/index"
  import NothingHereYet from "../organisms/NothingHereYet.svelte"
  import HeroHeading from "../organisms/HeroHeading.svelte"
  import CardList from "../organisms/CardList.svelte"

  import type { ITracksSource } from "@sing-types/Types"

  const sourceType: ITracksSource = "album"

  const navigate = useNavigate()

  // TODO display one album with non-album tagged tracks as the "Unknown album"
</script>

{#await $albums then allAlbums}
  <HeroHeading
    title="Your albums"
    metadata={[
      { label: `${allAlbums.length} album${allAlbums.length > 1 ? "s" : ""}` },
    ]}
  />
  {#if allAlbums.length === 0}
    <NothingHereYet />
  {:else}
    <CardList
      items={allAlbums.map((album) => ({
        title: album.name,
        id: album.name,
        image: album.coverPath,
        secondaryText: album.artist,
      }))}
      on:play={({ detail: id }) =>
        player.playFromSource({ id, type: sourceType })}
    />
  {/if}
{/await}
