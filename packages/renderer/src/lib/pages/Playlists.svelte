<script lang="ts">
  import { useNavigate } from "svelte-navigator"
  import { player } from "@/lib/manager/player/index"
  import { playlists } from "../manager/Playlists"
  import NothingHereYet from "../organisms/NothingHereYet.svelte"
  import HeroHeading from "../organisms/HeroHeading.svelte"
  import CardList from "../organisms/CardList.svelte"

  import { ROUTES } from "@/Consts"

  const navigate = useNavigate()

  // TODO display one album with non-album tagged tracks as the "Unknown album"
</script>

<HeroHeading
  title="Your albums"
  metadata={[
    {
      label: `${$playlists.length} playlist${$playlists.length > 1 ? "s" : ""}`,
    },
  ]}
/>

{#if $playlists.length === 0}
  <NothingHereYet />
{:else}
  <CardList
    items={$playlists.map(({ id }) => ({
      title: id,
      id,
      secondaryText: "Playlist",
    }))}
    on:play={({ detail: id }) =>
      player.playFromSource({
        id,
        type: "playlists",
        sort: ["trackNo", "ascending"],
      })}
    on:clickedPrimary={({ detail: id }) => navigate(`/${ROUTES.albums}/${id}`)}
    on:clickedSecondary={({ detail: id }) =>
      navigate(`/${ROUTES.artists}/${id}`)}
  />
{/if}
