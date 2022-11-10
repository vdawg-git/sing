<script lang="ts">
  import { either } from "fp-ts"
  import { useParams } from "svelte-navigator"
  import IconShuffle from "virtual:icons/eva/shuffle-2-outline"
  import IconPlay from "virtual:icons/heroicons-outline/play"

  import type { IError, ISortOptions } from "@sing-types/Types"
  import type { IAlbum, ITrack } from "@sing-types/DatabaseTypes"
  import { displayTypeWithCount } from "@sing-shared/Pures"

  import { addNotification } from "@/lib/stores/NotificationStore"
  import type {
    IHeroAction,
    IHeroMetaDataItem,
    ITrackListDisplayOptions,
  } from "@/types/Types"
  import { createAddToPlaylistAndQueueMenuItems } from "@/Helper"

  import { playNewSource } from "../manager/player"
  import { backgroundImages } from "../stores/BackgroundImages"
  import { playlistsStore } from "../stores/PlaylistsStore"

  import HeroHeading from "@/lib/organisms/HeroHeading.svelte"
  import TrackList from "@/lib/organisms/TrackList.svelte"

  import type { Either } from "fp-ts/lib/Either"

  export let albumID: string

  const parameters = useParams<{ albumID: string }>()

  // TODO fix the sorting.
  const defaultSort: ISortOptions["tracks"] = ["trackNo", "ascending"]

  let album: IAlbum | undefined

  // Update the page when the album is changed on navigation
  parameters.subscribe(async ({ albumID: newAlbumID }) => {
    album = await getAlbum(newAlbumID)
    backgroundImages.set(album?.cover)
  })

  let tracks: readonly ITrack[] = []
  $: tracks = album !== undefined ? album?.tracks : []

  let metadata: IHeroMetaDataItem[]
  $: metadata = [
    {
      label: displayTypeWithCount("track", tracks.length),
    },
  ]

  let actions: readonly IHeroAction[]
  $: actions = [
    {
      label: "Play",
      icon: IconPlay,
      callback: () =>
        playNewSource({
          source: "album",
          sourceID: albumID,
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
          source: "album",
          sourceID: albumID,
          sortBy: defaultSort,
          isShuffleOn: true,
        }),
      primary: false,
    },
  ]

  $: createContextMenuItems =
    createAddToPlaylistAndQueueMenuItems($playlistsStore)

  const displayOptions: ITrackListDisplayOptions = {
    cover: false,
    album: false,
  }

  async function getAlbum(id: string): Promise<IAlbum | undefined> {
    const albumEither: Either<IError, IAlbum> = await window.api.getAlbum({
      where: { name: id },
      sortBy: ["trackNo", "ascending"],
      isShuffleOn: false,
    })

    return either.getOrElseW((error) => {
      addNotification({ label: "Failed to get album", duration: 5 })
      console.log(error)

      return undefined
    })(albumEither)
  }
</script>

{#if album}
  <HeroHeading
    title={albumID}
    {metadata}
    image={album.cover}
    type="Album"
    {actions}
  />

  <TrackList
    testID="trackItems"
    {tracks}
    {displayOptions}
    on:play={({ detail }) =>
      playNewSource(
        {
          source: "album",
          sourceID: albumID,
          sortBy: defaultSort,
        },
        detail.index
      )}
    sort={defaultSort}
    {createContextMenuItems}
  />
{/if}
