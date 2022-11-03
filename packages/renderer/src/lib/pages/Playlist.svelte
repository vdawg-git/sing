<script lang="ts">
  import * as E from "fp-ts/Either"
  import { useParams } from "svelte-navigator"
  import IconShuffle from "virtual:icons/eva/shuffle-2-outline"
  import IconPlay from "virtual:icons/heroicons-outline/play"
  import { onDestroy } from "svelte"

  import type {
    IPlaylistTrack,
    IPlaylistWithTracks,
    ISortOptions,
  } from "@sing-types/Types"

  import type { IHeroAction, IHeroMetaDataItem } from "@/types/Types"
  import {
    createAddToPlaylistAndQueueMenuItems,
    displayTypeWithCount,
    notifiyError,
  } from "@/Helper"

  import { playNewSource } from "../manager/player"
  import { backgroundImages } from "../stores/BackgroundImages"
  import { playlistsStore } from "../stores/PlaylistsStore"

  import HeroHeading from "@/lib/organisms/HeroHeading.svelte"
  import TrackList from "@/lib/organisms/TrackList.svelte"

  export let playlistID: string

  const parameters = useParams<{ playlistID: string }>()

  // TODO fix the sorting.
  const defaultSort: ISortOptions["playlist"] = [
    "manualOrderIndex",
    "ascending",
  ]

  let playlist: IPlaylistWithTracks | undefined

  // Update the playlist when the it is changed on navigation
  const unsubsribeFromPlaylistChange = parameters.subscribe(
    // TODO Why is it calling this twice all the time
    ({ playlistID: newPlaylistID }) => getAndSetPlaylist(Number(newPlaylistID))
  )

  // Update the playlist when its content changes
  $: unsubscribeUpdate = window.api.on("playlistUpdated", (_, id) => {
    if (id !== playlist?.id) return () => ({})

    return getAndSetPlaylist(id)
  })

  onDestroy(() => {
    unsubsribeFromPlaylistChange()
    unsubscribeUpdate()
  })

  let tracks: readonly IPlaylistTrack[] | undefined = []
  $: tracks = playlist?.tracks

  let metadata: IHeroMetaDataItem[]
  $: metadata = [
    {
      label: displayTypeWithCount("track", tracks?.length ?? 0),
    },
  ]

  let actions: readonly IHeroAction[]
  $: actions = [
    {
      label: "Play",
      icon: IconPlay,
      callback: () =>
        playNewSource({
          source: "playlist",
          sourceID: Number(playlistID),
          sortBy: defaultSort,
          isShuffleOn: false,
        }),
      primary: true,
    },
    {
      label: "Shuffle",
      icon: IconShuffle,
      callback: () =>
        playNewSource({
          source: "playlist",
          sourceID: Number(playlistID),
          sortBy: defaultSort,
          isShuffleOn: true,
        }),
      primary: false,
    },
  ]

  $: createContextMenuItems =
    createAddToPlaylistAndQueueMenuItems($playlistsStore)

  async function getAndSetPlaylist(id: number) {
    window.api.getPlaylist({ where: { id } }).then(
      E.fold(
        (error) => {
          notifiyError("Failed to get playlist")(error)
          return undefined
        },
        (newPlaylist) => {
          // backgroundImages.set(
          //   newPlaylist?.items
          //     .map(({trackID}) => trackID)
          //     .filter(isDefined)
          //     .filter(removeDuplicates)
          // )

          playlist = newPlaylist
        }
      )
    )
  }
</script>

{#if playlist}
  <HeroHeading
    title={playlist.name}
    {metadata}
    image={playlist.thumbnailCovers}
    type="Playlist"
    {actions}
  />
  {#if tracks && tracks?.length > 0}
    <TrackList
      testID="trackItems"
      {tracks}
      on:play={({ detail }) =>
        playNewSource(
          {
            source: "playlist",
            sourceID: Number(playlistID),
            sortBy: defaultSort,
          },
          detail.index
        )}
      sort={defaultSort}
      {createContextMenuItems}
    />
  {:else}
    No tracks
  {/if}
{/if}
