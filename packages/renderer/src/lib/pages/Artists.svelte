<script lang="ts">
  import { useNavigate } from "svelte-navigator"
  import { artists } from "@/lib/manager/player/index"
  import NothingHereYet from "../organisms/NothingHereYet.svelte"
  import HeroHeading from "../organisms/HeroHeading.svelte"

  import type { ISourceType } from "@/types/Types"
  import CardList from "../organisms/CardList.svelte"

  const sourceType: ISourceType = "ALL_TRACKS"

  const navigate = useNavigate()

  console.log($artists)

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
      }))}
      isImageCircle={true}
    />
  {/if}
{/await}
