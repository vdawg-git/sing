<script lang="ts">
  import * as E from "fp-ts/Either"
  import { useParams } from "svelte-navigator"
  import IconShuffle from "virtual:icons/eva/shuffle-2-outline"
  import IconPlay from "virtual:icons/heroicons-outline/play"
  import { onDestroy } from "svelte"
  import { isDefined } from "ts-is-present"

  import { displayTypeWithCount, removeDuplicates } from "@sing-shared/Pures"


  import { createAddToPlaylistAndQueueMenuItems, notifiyError } from "@/Helper"
  import { playNewSource } from "@/lib/manager/player"

  import { backgroundImages } from "../stores/BackgroundImages"
  import { playlistsStore } from "../stores/PlaylistsStore"
  import EditPlaylistModal from "../organisms/EditPlaylistModal.svelte"
  import CoverPicker from "../molecules/CoverPicker.svelte"

  import HeroHeading from "@/lib/organisms/HeroHeading.svelte"
  import TrackList from "@/lib/organisms/TrackList.svelte"

  import type {
    ICreateMenuOutOfTrack,
    IHeroAction,
    IHeroMetaDataItem,
  } from "@/types/Types"
  import type { TypedIpcRenderer } from "@sing-preload/types/Types"
  import type { IPlaylistID } from "@sing-types/Opaque"
  import type { ISortOptions } from "@sing-types/Types"
  import type {
    IPlaylistTrack,
    IPlaylistWithTracks,
  } from "@sing-types/DatabaseTypes"


  export let playlistID: string

  const parameters = useParams<{ playlistID: string }>()

  // TODO fix the sorting.
  const defaultSort: ISortOptions["playlist"] = [
    "manualOrderIndex",
    "ascending",
  ]

  let playlist: IPlaylistWithTracks | undefined
  let isShowingEditModal = false

  $: covers = playlist?.thumbnailCovers?.map(({ filepath }) => filepath)

  // Update the playlist when the it is changed on navigation
  const unsubsribeFromURLChange = parameters.subscribe(
    // TODO Why is it calling this twice all the time
    ({ playlistID: newPlaylistID }) => getAndSetPlaylist(Number(newPlaylistID))
  )

  // Update the playlist when its content changes
  let unsubscribeFromPlaylistUpdate: () => TypedIpcRenderer
  $: {
    // When the playlist changes
    if (playlist) {
      unsubscribeFromPlaylistUpdate && unsubscribeFromPlaylistUpdate()

      unsubscribeFromPlaylistUpdate = window.api.on(
        "playlistUpdated",
        (_, id) => {
          if (id !== playlist?.id) return

          getAndSetPlaylist(id)
        }
      )
    }
  }

  onDestroy(() => {
    unsubsribeFromURLChange()
    unsubscribeFromPlaylistUpdate()
  })

  let tracks: readonly IPlaylistTrack[] | undefined = []
  $: tracks = playlist?.tracks

  let metadata: IHeroMetaDataItem[]
  $: metadata = [
    {
      label: displayTypeWithCount("track", tracks?.length ?? 0),
    },
  ]

  let heroButtons: readonly IHeroAction[]
  $: heroButtons = [
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

  let createContextMenuItems: ICreateMenuOutOfTrack
  $: createContextMenuItems = (item) => [
    ...createAddToPlaylistAndQueueMenuItems($playlistsStore)(item),
    { type: "spacer" },
    {
      type: "item",
      label: "Remove from playlist",
      onClick: () => {
        window.api.removeTracksFromPlaylist({
          id: playlist?.id as IPlaylistID,
          trackIDs: Array.isArray(item.id) ? item.id : [item.id],
        })
      },
    },
  ]

  let pickImage: () => Promise<void>

  async function getAndSetPlaylist(id: number) {
    window.api.getPlaylist({ where: { id } }).then(
      E.fold(
        (error) => {
          notifiyError("Failed to get playlist")(error)
          return undefined
        },
        (newPlaylist) => {
          backgroundImages.set(
            newPlaylist.tracks
              .map(({ cover }) => cover)
              .filter(isDefined)
              .filter(removeDuplicates)
          )

          playlist = newPlaylist
        }
      )
    )
  }

  async function toggleModal() {
    isShowingEditModal = !isShowingEditModal
  }
</script>

<!---------->
<!-- HTML -->
<!---------->

{#if playlist}
  <HeroHeading
    title={playlist.name}
    {metadata}
    image={covers}
    type="Playlist"
    actions={heroButtons}
    description={playlist.description}
    handleClickTitle={toggleModal}
    handleClickDescription={toggleModal}
    ><CoverPicker
      slot="cover"
      image={covers}
      handleOnClick={async () => {
        await toggleModal()
        await pickImage()
      }}
    />
  </HeroHeading>

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

{#if isShowingEditModal && playlist}
  <EditPlaylistModal {playlist} on:hide={toggleModal} bind:pickImage />
{/if}
