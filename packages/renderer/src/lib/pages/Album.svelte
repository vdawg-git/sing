<script lang="ts">
  import { either } from "fp-ts"
  import HeroHeading from "@/lib/organisms/HeroHeading.svelte"
  import TrackList from "@/lib/organisms/TrackList.svelte"
  import { addNotification } from "@/lib/stores/NotificationStore"

  import type { IAlbumWithTracks, IError, ITrack } from "@sing-types/Types"
  import type {
    IHeroAction,
    IHeroMetaDataItem,
    ISourceType,
    ITrackListDisplayOptions,
  } from "@/types/Types"
  import type { Either } from "fp-ts/lib/Either"
  import { onMount } from "svelte"
  import IconPlay from "virtual:icons/heroicons-outline/play"
  import IconShuffle from "virtual:icons/eva/shuffle-2-outline"

  export let albumID: string

  let album: IAlbumWithTracks | undefined = undefined

  const sourceType: ISourceType = "ALBUM"

  let tracks: ITrack[] = []
  $: tracks = album !== undefined ? (album?.tracks as ITrack[]) : []

  let metadata: IHeroMetaDataItem[]
  $: metadata = [
    {
      label: `${tracks.length} track${tracks.length > 1 ? "s" : ""}`,
    },
  ]

  const actions: IHeroAction[] = [
    {
      label: "Play",
      icon: IconPlay,
      callback: () => {},
      primary: true,
    },
    { label: "Shuffle", icon: IconShuffle, callback: () => {}, primary: false },
  ]

  onMount(async () => {
    album = await getAlbum(albumID)
  })

  const displayOptions: ITrackListDisplayOptions = {
    cover: false,
    album: false,
  }

  async function getAlbum(albumID: string) {
    const albumEither: Either<IError, IAlbumWithTracks> =
      await window.api.getAlbum({
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
    image={album.coverPath}
    type="Album"
    {actions}
  />

  <TrackList testID="trackItems" {sourceType} {tracks} {displayOptions} />
{/if}
