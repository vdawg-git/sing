<script lang="ts">
  import { playNewSource, tracks } from "@/lib/manager/player/index"
  import HeroHeading from "@/lib/organisms/HeroHeading.svelte"
  import NothingHereYet from "@/lib/organisms/NothingHereYet.svelte"
  import TrackList from "@/lib/organisms/TrackList.svelte"
  import { isPresent } from "ts-is-present"
  import { removeDuplicates } from "@sing-shared/Pures"

  import { backgroundImagesStore } from "../stores/BackgroundImages"

  import type { IHeroMetaDataItem } from "@/types/Types"
  import type { ITracksSource } from "@sing-types/Types"

  const sourceType: ITracksSource = "tracks"

  let metadata: IHeroMetaDataItem[] = [{ label: `${$tracks.length} tracks` }]

  $: {
    backgroundImagesStore.set(
      $tracks
        .map((track) => track.cover)
        .filter(isPresent)
        .filter(removeDuplicates)
    )
  }

  // TODO Background images include artists and album covers
</script>

<HeroHeading title="Your tracks" {metadata} />

{#if $tracks.length === 0}
  <NothingHereYet />
{:else}
  <TrackList
    testID="trackItems"
    tracks={$tracks}
    sort={["title", "ascending"]}
    on:play={({ detail }) =>
      playNewSource(
        {
          source: sourceType,
          sort: detail.sort,
        },
        detail.index
      )}
  />
{/if}
