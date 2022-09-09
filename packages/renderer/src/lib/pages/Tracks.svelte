<script lang="ts">
  import { player, tracks } from "@/lib/manager/player/index"
  import HeroHeading from "@/lib/organisms/HeroHeading.svelte"
  import NothingHereYet from "@/lib/organisms/NothingHereYet.svelte"
  import TrackList from "@/lib/organisms/TrackList.svelte"

  import type { IHeroMetaDataItem } from "@/types/Types"
  import { removeDuplicates } from "@sing-shared/Pures"
  import type { FilePath } from "@sing-types/Filesystem"
  import type { ITracksSource } from "@sing-types/Types"

  const sourceType: ITracksSource = "tracks"

  let metadata: IHeroMetaDataItem[] = [{ label: `${$tracks.length} tracks` }]
  let backgroundImages: FilePath[] | FilePath | undefined = $tracks
    .map((track) => track.cover)
    .filter(removeDuplicates)
</script>

<HeroHeading title="Your tracks" {metadata} {backgroundImages} />

{#if $tracks.length === 0}
  <NothingHereYet />
{:else}
  <TrackList
    testID="trackItems"
    tracks={$tracks}
    sort={["title", "ascending"]}
    on:play={({ detail }) =>
      player.playFromSource(
        {
          type: sourceType,
          sort: detail.sort,
        },
        detail.index
      )}
  />
{/if}
