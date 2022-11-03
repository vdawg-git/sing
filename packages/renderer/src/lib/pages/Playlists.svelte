<script lang="ts">
  import { useNavigate } from "svelte-navigator"

  import { ROUTES } from "@/Consts"
  import { playNewSource, tracks } from "@/lib/manager/player"
  import { backgroundImages } from "@/lib/stores/BackgroundImages"
  import {
    createAddToPlaylistAndQueueMenuItems,
    createAndNavigateToPlaylist,
  } from "@/Helper"

  import { playlistsStore } from "../stores/PlaylistsStore"
  import Button from "../atoms/Button.svelte"

  import CardList from "@/lib/organisms/CardList.svelte"
  import HeroHeading from "@/lib/organisms/HeroHeading.svelte"
  import NothingHereYet from "@/lib/organisms/NothingHereYet.svelte"

  const navigate = useNavigate()

  // TODO add "Create your first playlist" button

  $: {
    // TODO add background images from the playlists thumbs
    backgroundImages.reset()
  }
</script>

<HeroHeading
  title="Your playlists"
  metadata={[
    {
      label: `${$playlistsStore.length} playlist${
        $playlistsStore.length > 1 ? "s" : ""
      }`,
    },
  ]}
/>

{#if $tracks.length === 0}
  <NothingHereYet />
{:else if $playlistsStore.length === 0}
  <Button
    label="Create your first playlist"
    primary={false}
    on:click={() => createAndNavigateToPlaylist(navigate)}
  />
{:else}
  <CardList
    items={$playlistsStore.map((playlist) => ({
      title: playlist.name,
      id: playlist.id,
      image: playlist.thumbnailCovers,
      secondaryText: "Playlist",
      contextMenuItems:
        createAddToPlaylistAndQueueMenuItems($playlistsStore)(playlist),
    }))}
    on:play={({ detail: id }) =>
      playNewSource({
        sourceID: id,
        source: "playlist",
        sortBy: ["trackNo", "ascending"],
      })}
    on:clickedPrimary={({ detail: id }) =>
      navigate(`/${ROUTES.playlists}/${id}`)}
  />
{/if}
