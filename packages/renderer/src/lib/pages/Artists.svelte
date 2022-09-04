<script lang="ts">
  import { useNavigate } from "svelte-navigator"
  import { player, artists } from "@/lib/manager/player/index"
  import NothingHereYet from "../organisms/NothingHereYet.svelte"
  import HeroHeading from "../organisms/HeroHeading.svelte"
  import CardList from "../organisms/CardList.svelte"

  import { ROUTES } from "@/Consts"

  const navigate = useNavigate()

  function navigateToArtist({ detail: id }: { detail: number }) {
    navigate(`/${ROUTES.artists}/${id}`)
  }

  // TODO display one artist with non-artist tagged tracks as the "Unknown artist"
</script>

{#await $artists then allArtists}
  <HeroHeading
    title="Your artists"
    metadata={[
      {
        label: `${allArtists.length} artist${allArtists.length > 1 ? "s" : ""}`,
      },
    ]}
  />
  {#if allArtists.length === 0}
    <NothingHereYet />
  {:else}
    <CardList
      items={allArtists.map((artist) => ({
        title: artist.name,
        id: artist.name,
        image: artist.albums.find((album) => album.cover !== undefined)?.cover,
        secondaryText: "Artist",
      }))}
      isImageCircle={true}
      on:play={({ detail: id }) =>
        player.playFromSource({
          id,
          type: "artists",
          sort: ["album", "ascending"],
          index: 0,
        })}
      on:clickedPrimary={navigateToArtist}
      on:clickedSecondary={navigateToArtist}
    />
  {/if}
{/await}
