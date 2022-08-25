<script lang="ts">
  import { tracks } from "@/lib/manager/player/index"
  import type { IHeroMetaDataItem, ISourceType } from "@/types/Types"
  import HeroHeading from "../organisms/HeroHeading.svelte"
  import NothingHereYet from "../organisms/NothingHereYet.svelte"
  import TrackList from "../organisms/TrackList.svelte"

  const sourceType: ISourceType = "ALL_TRACKS"

  let metadata: IHeroMetaDataItem[] = [{ label: `${$tracks.length} tracks` }]
</script>

<HeroHeading title="Your tracks" {metadata} />

{#if $tracks.length === 0}
  <NothingHereYet />
{:else}
  <TrackList testID="trackItems" {sourceType} tracks={$tracks} />
{/if}
