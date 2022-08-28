<script lang="ts">
  import { useNavigate } from "svelte-navigator"
  import player, { artists } from "@/lib/manager/player/index"
  import NothingHereYet from "../organisms/NothingHereYet.svelte"
  import HeroHeading from "../organisms/HeroHeading.svelte"
  import CardList from "../organisms/CardList.svelte"

  import type { ITracksSource } from "@sing-types/Types"

  const sourceType: ITracksSource = "artist"

  const navigate = useNavigate()

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
      }))}
      isImageCircle={true}
      on:play={({ detail: id }) =>
        player.playFromSource({ id, type: sourceType })}
    />
  {/if}
{/await}
