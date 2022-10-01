<script lang="ts">
  import { useNavigate } from "svelte-navigator"
  import { albums, playNewSource } from "@/lib/manager/player/index"
  import NothingHereYet from "../organisms/NothingHereYet.svelte"
  import HeroHeading from "../organisms/HeroHeading.svelte"
  import CardList from "../organisms/CardList.svelte"

  import { ROUTES } from "@/Consts"
  import { isPresent } from "ts-is-present"
  import { removeDuplicates } from "@sing-shared/Pures"
  import { backgroundImagesStore } from "../stores/BackgroundImages"

  const navigate = useNavigate()

  $: {
    backgroundImagesStore.set(
      $albums
        .map((album) => album.cover)
        .filter(isPresent)
        .filter(removeDuplicates)
    )
  }

  // TODO display one album with non-album tagged tracks as the "Unknown album"
</script>

<HeroHeading
  title="Your albums"
  metadata={[
    { label: `${$albums.length} album${$albums.length > 1 ? "s" : ""}` },
  ]}
/>
{#if $albums.length === 0}
  <NothingHereYet />
{:else}
  <CardList
    items={$albums.map((album) => ({
      title: album.name,
      id: album.name,
      image: album.cover,
      secondaryText: album.artist,
    }))}
    on:play={({ detail: id }) =>
      playNewSource({
        sourceID: id,
        source: "albums",
        sort: ["trackNo", "ascending"],
      })}
    on:clickedPrimary={({ detail: id }) => navigate(`/${ROUTES.albums}/${id}`)}
    on:clickedSecondary={({ detail: id }) =>
      navigate(`/${ROUTES.artists}/${id}`)}
  />
{/if}
