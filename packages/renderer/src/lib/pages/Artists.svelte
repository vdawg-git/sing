<script lang="ts">
  import { useNavigate } from "svelte-navigator"
  import { isPresent } from "ts-is-present"

  import { removeDuplicates } from "@sing-shared/Pures"

  import { ROUTES } from "@/Consts"
  import { artists, playNewSource } from "@/lib/manager/Player"
  import { backgroundImages } from "@/lib/stores/BackgroundImages"
  import { createAddToPlaylistAndQueueMenuItems } from "@/Helper"

  import { playlistsStore } from "../stores/PlaylistsStore"

  import CardList from "@/lib/organisms/CardList.svelte"
  import HeroHeading from "@/lib/organisms/HeroHeading.svelte"
  import NothingHereYet from "@/lib/organisms/NothingHereYet.svelte"

  const navigate = useNavigate()

  function navigateToArtist({ detail: id }: { detail: number }) {
    navigate(`/${ROUTES.artists}/${id}`)
  }

  $: {
    backgroundImages.set(
      $artists
        .map((artist) => artist.image)
        .filter(isPresent)
        .filter(removeDuplicates)
    )
  }

  // TODO Background images include artists images
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
        contextMenuItems: createAddToPlaylistAndQueueMenuItems($playlistsStore)(
          { type: "artist", name: artist.name }
        ),
      }))}
      isImageCircle={true}
      on:play={({ detail: id }) =>
        playNewSource({
          sourceID: id,
          source: "artist",
          sortBy: ["album", "ascending"],
        })}
      on:clickedPrimary={navigateToArtist}
      on:clickedSecondary={navigateToArtist}
    />
  {/if}
{/await}
