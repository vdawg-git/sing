<script lang="ts">
  import { isPresent } from "ts-is-present"

  import { displayTypeWithCount, removeDuplicates } from "@sing-shared/Pures"

  import { createAddToPlaylistAndQueueMenuItems } from "@/MenuItemsHelper"
  import { playNewSource, tracks } from "@/lib/manager/Player"

  import { backgroundImages } from "../stores/BackgroundImages"
  import { playlistsStore } from "../stores/PlaylistsStore"

  import HeroHeading from "@/lib/organisms/HeroHeading.svelte"
  import NothingHereYet from "@/lib/organisms/NothingHereYet.svelte"
  import TrackList from "@/lib/organisms/TrackList.svelte"

  import type { IHeroMetaDataItem } from "@/types/Types"
  import type { IPlaySource, ISortOptions } from "@sing-types/Types"

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

<HeroHeading title="Your tracks" {metadata} titleTestID={"yourTracksTitle"} />

{#if $tracks.length === 0}
  <NothingHereYet />
{:else}
  <TrackList
    tracks={$tracks}
    sort={defaultSort}
    on:play={({ detail }) =>
      playNewSource({
        source,
        sortBy: defaultSort,
        firstTrack: detail.track,
        index: detail.index,
      })}
    {createContextMenuItems}
  />
{/if}
