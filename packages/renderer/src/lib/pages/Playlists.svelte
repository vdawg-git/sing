<script lang="ts">
  import { useNavigate } from "svelte-navigator"

  import { createPlaylistURI } from "@/Routes"
  import { backgroundImages } from "@/lib/stores/BackgroundImages"
  import { createAndNavigateToPlaylist } from "@/Helper"
  import { playNewSource, tracks } from "@/lib/manager/player"
  import { createAddToPlaylistAndQueueMenuItems } from "@/MenuItemsHelper"

  import { playlistsStore } from "../stores/PlaylistsStore"
  import Button from "../atoms/Button.svelte"

  import CardList from "@/lib/organisms/CardList.svelte"
  import HeroHeading from "@/lib/organisms/HeroHeading.svelte"
  import NothingHereYet from "@/lib/organisms/NothingHereYet.svelte"

  import type { ICardProperties, IMenuItemsArgument } from "@/types/Types"
  import type { IPlaylist } from "@sing-types/DatabaseTypes"

  const navigate = useNavigate()

  // TODO add "Create your first playlist" button

  let items: ICardProperties[]
  $: items = $playlistsStore.map((playlist) => ({
    title: playlist.name,
    onPlay: () =>
      playNewSource({
        sourceID: playlist.id,
        source: "playlist",
        sortBy: ["trackNo", "ascending"],
        isShuffleOn: false,
        index: 0,
      }),
    onClickPrimary: () => navigate(createPlaylistURI(playlist.id)),
    image: playlist.thumbnailCovers?.map(({ filepath }) => filepath),
    secondaryText: "Playlist",
    contextMenuItems: createContextMenuItems(playlist),
  }))

  $: {
    // TODO add background images from the playlists thumbs
    backgroundImages.reset()
  }

  function createContextMenuItems(playlist: IPlaylist): IMenuItemsArgument {
    return [
      ...createAddToPlaylistAndQueueMenuItems($playlistsStore)({
        type: "playlist",
        id: playlist.id,
        name: `${playlist.name} copy`,
      }),
      {
        label: "Remove playlist",
        onClick: async () => window.api.deletePlaylist(playlist.id),
        type: "item",
      },
    ]
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
  titleTestID="yourPlaylistsTitle"
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
  <CardList {items} testID="playlistCards" cardTestAttributes="playlistCard" />
{/if}
