<script lang="ts">
  import { useNavigate } from "svelte-navigator"
  import { player, albums } from "@/lib/manager/player/index"
  import NothingHereYet from "../organisms/NothingHereYet.svelte"
  import HeroHeading from "../organisms/HeroHeading.svelte"
  import CardList from "../organisms/CardList.svelte"

  import { ROUTES } from "@/Consts"

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
        image: album.cover,
        secondaryText: album.artist,
      }))}
      on:play={({ detail: id }) =>
        player.playFromSource({
          id,
          type: "albums",
          sort: ["trackNo", "ascending"],
        })}
      on:clickedPrimary={({ detail: id }) =>
        navigate(`/${ROUTES.albums}/${id}`)}
      on:clickedSecondary={({ detail: id }) =>
        navigate(`/${ROUTES.artists}/${id}`)}
    />
  {/if}
{/await}
