<script lang="ts">
  import { isPresent } from "ts-is-present"

  import { displayTypeWithCount, removeDuplicates } from "@sing-shared/Pures"
  import type { IPlaySource, ISortOptions } from "@sing-types/Types"

  import type { IHeroMetaDataItem } from "@/types/Types"
  import { createAddToPlaylistAndQueueMenuItems } from "@/Helper"
  import { playNewSource, tracks } from "@/lib/manager/player"

  import { backgroundImages } from "../stores/BackgroundImages"
  import { playlistsStore } from "../stores/PlaylistsStore"

  import HeroHeading from "@/lib/organisms/HeroHeading.svelte"
  import NothingHereYet from "@/lib/organisms/NothingHereYet.svelte"
  import TrackList from "@/lib/organisms/TrackList.svelte"

  const source: IPlaySource = "allTracks"
  const defaultSort: ISortOptions["tracks"] = ["title", "ascending"]

  let metadata: IHeroMetaDataItem[] = [
    { label: displayTypeWithCount("track", $tracks.length) },
  ]

  $: createContextMenuItems =
    createAddToPlaylistAndQueueMenuItems($playlistsStore)

  $: {
    backgroundImages.set(
      $tracks
        .map((track) => track.cover)
        .filter(isPresent)
        .filter(removeDuplicates)
    )
  }
</script>

<HeroHeading title="Your tracks" {metadata} />

{#if $tracks.length === 0}
  <NothingHereYet />
{:else}
  <TrackList
    testID="trackItems"
    tracks={$tracks}
    sort={defaultSort}
    on:play={({ detail }) =>
      playNewSource({ source, sortBy: defaultSort }, detail.index)}
    {createContextMenuItems}
  />
{/if}
