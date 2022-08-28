<script lang="ts">
  import player, { tracks } from "@/lib/manager/player/index"
  import HeroHeading from "@/lib/organisms/HeroHeading.svelte"
  import NothingHereYet from "@/lib/organisms/NothingHereYet.svelte"
  import TrackList from "@/lib/organisms/TrackList.svelte"

  import type { IHeroMetaDataItem } from "@/types/Types"
  import type { ITracksSource } from "@sing-types/Types"

  const sourceType: ITracksSource = "track"

  let metadata: IHeroMetaDataItem[] = [{ label: `${$tracks.length} tracks` }]
</script>

<HeroHeading title="Your tracks" {metadata} />

{#if $tracks.length === 0}
  <NothingHereYet />
{:else}
  <TrackList
    testID="trackItems"
    tracks={$tracks}
    on:play={({ detail }) =>
      player.playFromSource({
        type: sourceType,
        id: detail.id,
        index: detail.index,
      })}
  />
{/if}
