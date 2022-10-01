<script lang="ts">
  import { either } from "fp-ts"
  import IconPlay from "virtual:icons/heroicons-outline/play"
  import IconShuffle from "virtual:icons/eva/shuffle-2-outline"
  import { useParams } from "svelte-navigator"

  import { addNotification } from "@/lib/stores/NotificationStore"
  import { playNewSource } from "../manager/player"
  import HeroHeading from "@/lib/organisms/HeroHeading.svelte"
  import TrackList from "@/lib/organisms/TrackList.svelte"

  import type { Either } from "fp-ts/lib/Either"
  import type { IAlbum, IError, ITrack } from "@sing-types/Types"
  import type {
    IHeroAction,
    IHeroMetaDataItem,
    ITrackListDisplayOptions,
  } from "@/types/Types"
  import { backgroundImagesStore } from "../stores/BackgroundImages"

  export let albumID: string

  const params = useParams<{ albumID: string }>()

  let album: IAlbum | undefined

  // Update the page when the album is changed on navigation
  params.subscribe(async ({ albumID }) => {
    album = await getAlbum(albumID)
    backgroundImagesStore.set(album?.cover)
  })

  let tracks: readonly ITrack[] = []
  $: tracks = album !== undefined ? album?.tracks : []

  let metadata: IHeroMetaDataItem[]
  $: metadata = [
    {
      label: `${tracks.length} track${tracks.length > 1 ? "s" : ""}`,
    },
  ]

  let actions: readonly IHeroAction[]
  $: actions = [
    {
      label: "Play",
      icon: IconPlay,
      callback: () =>
        playNewSource({
          source: "albums",
          sourceID: albumID,
          sort: ["trackNo", "ascending"],
        }),
      primary: true,
    },
    { label: "Shuffle", icon: IconShuffle, callback: () => {}, primary: false },
  ]

  const displayOptions: ITrackListDisplayOptions = {
    cover: false,
    album: false,
  }

  async function getAlbum(albumID: string) {
    const albumEither: Either<IError, IAlbum> = await window.api.getAlbum({
      where: { name: albumID },
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
          source: "albums",
          sourceID: albumID,
          sort: ["trackNo", "ascending"],
        },
        detail.index
      )}
    sort={["trackNo", "ascending"]}
  />
{/if}
