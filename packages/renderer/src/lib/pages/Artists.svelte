<script lang="ts">
  import { useNavigate } from "svelte-navigator"
  import { artists, playNewSource } from "@/lib/manager/player/index"
  import NothingHereYet from "../organisms/NothingHereYet.svelte"
  import HeroHeading from "../organisms/HeroHeading.svelte"
  import CardList from "../organisms/CardList.svelte"

  import { ROUTES } from "@/Consts"
  import { backgroundImagesStore } from "../stores/BackgroundImages"
  import { isPresent } from "ts-is-present"
  import { removeDuplicates } from "@sing-shared/Pures"

  const navigate = useNavigate()

  function navigateToArtist({ detail: id }: { detail: number }) {
    navigate(`/${ROUTES.artists}/${id}`)
  }

  $: {
    backgroundImagesStore.set(
      $artists
        .map((artist) => artist.image)
        .filter(isPresent)
        .filter(removeDuplicates)
    )
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
        playNewSource({
          sourceID: id,
          source: "artists",
          sort: ["album", "ascending"],
        })}
      on:clickedPrimary={navigateToArtist}
      on:clickedSecondary={navigateToArtist}
    />
  {/if}
{/await}
