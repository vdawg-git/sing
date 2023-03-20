<script lang="ts">
  import { isPresent } from "ts-is-present"

  import { displayTypeWithCount, removeDuplicates } from "@sing-shared/Pures"

  import { createAddToPlaylistAndQueueMenuItems } from "@/MenuItemsHelper"
  import { tracks } from "@/lib/manager/Player"
  import { PAGE_TITLES } from "@/Constants"
  import { createDefaultTitleButtons } from "@/Helper"

  import { backgroundImages } from "../stores/BackgroundImages"
  import { playlistsStore } from "../stores/PlaylistsStore"

  import HeroHeading from "@/lib/organisms/HeroHeading.svelte"
  import NothingHereYet from "@/lib/organisms/NothingHereYet.svelte"
  import TrackList from "@/lib/organisms/TrackList.svelte"

  import type { IHeroButton, IHeroMetaDataItem } from "@/types/Types"
  import type { IPlaySource } from "@sing-types/Types"

  const source: IPlaySource = { origin: "allTracks" }

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

  let buttons: IHeroButton[]
  $: buttons = createDefaultTitleButtons(source)
</script>

<HeroHeading title={PAGE_TITLES.tracks} {metadata} {buttons} />

{#if $tracks.length === 0}
  <NothingHereYet />
{:else}
  <TrackList tracks={$tracks} {source} {createContextMenuItems} />
{/if}
