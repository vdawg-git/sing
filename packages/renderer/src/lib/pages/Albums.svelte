<script lang="ts">
  import { useNavigate } from "svelte-navigator"
  import { isPresent } from "ts-is-present"

  import { displayTypeWithCount, removeDuplicates } from "@sing-shared/Pures"

  import { ROUTES } from "@/Consts"
  import { albums, playNewSource } from "@/lib/manager/Player"
  import { backgroundImages } from "@/lib/stores/BackgroundImages"
  import { createAddToPlaylistAndQueueMenuItems } from "@/Helper"

  import { playlistsStore } from "../stores/PlaylistsStore"

  import CardList from "@/lib/organisms/CardList.svelte"
  import HeroHeading from "@/lib/organisms/HeroHeading.svelte"
  import NothingHereYet from "@/lib/organisms/NothingHereYet.svelte"

  const navigate = useNavigate()

  $: {
    backgroundImages.set(
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
    {
      label: displayTypeWithCount("album", $albums.length),
    },
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
      contextMenuItems: createAddToPlaylistAndQueueMenuItems($playlistsStore)({
        type: "album",
        name: album.name,
      }),
    }))}
    on:play={({ detail: id }) =>
      playNewSource({
        sourceID: id,
        source: "album",
        sortBy: ["trackNo", "ascending"],
      })}
    on:clickedPrimary={({ detail: id }) => navigate(`/${ROUTES.albums}/${id}`)}
    on:clickedSecondary={({ detail: id }) =>
      navigate(`/${ROUTES.artists}/${id}`)}
  />
{/if}
