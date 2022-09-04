<script lang="ts">
  import { onMount } from "svelte"
  import { either } from "fp-ts"
  import { addNotification } from "@/lib/stores/NotificationStore"
  import IconPlay from "virtual:icons/heroicons-outline/play"
  import IconShuffle from "virtual:icons/eva/shuffle-2-outline"

  import HeroHeading from "@/lib/organisms/HeroHeading.svelte"
  import TrackList from "@/lib/organisms/TrackList.svelte"

  import type { Either } from "fp-ts/lib/Either"
  import type { IAlbum, IError, ITrack } from "@sing-types/Types"
  import type {
    IHeroAction,
    IHeroMetaDataItem,
    ITrackListDisplayOptions,
  } from "@/types/Types"
  import { player } from "../manager/player"

  export let albumID: string

  let album: IAlbum | undefined = undefined

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
      callback: () =>
        player.playFromSource({
          type: "albums",
          id: albumID,
          sort: ["trackNo", "ascending"],
        }),
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
      player.playFromSource(
        {
          type: "albums",
          id: albumID,
          sort: ["trackNo", "ascending"],
        },
        detail.index
      )}
    sort={["trackNo", "ascending"]}
  />
{/if}
