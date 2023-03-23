<script lang="ts">
  import { either } from "fp-ts"
  import { useParams } from "svelte-navigator"
  import { onMount } from "svelte"

  import { displayTypeWithCount } from "@sing-shared/Pures"

  import { addNotification } from "@/lib/stores/NotificationStore"
  import { createAddToPlaylistAndQueueMenuItems } from "@/MenuItemsHelper"
  import { createArtistURI } from "@/Routes"
  import { createDefaultTitleButtons } from "@/Helper"

  import { backgroundImages } from "../stores/BackgroundImages"
  import { playlistsStore } from "../stores/PlaylistsStore"

  import HeroHeading from "@/lib/organisms/HeroHeading.svelte"
  import TrackList from "@/lib/organisms/TrackList.svelte"

  import type {
    IHeroButton,
    IHeroMetaDataItem,
    ITrackListDisplayOptions,
  } from "@/types/Types"
  import type { IAlbum, ITrack } from "@sing-types/DatabaseTypes"
  import type { IError, IPlaySource } from "@sing-types/Types"
  import type { Either } from "fp-ts/lib/Either"

  /**
   * This gets set automatically by svelte-navigator as a string.
   */
  export let albumID: number | string

  // The parameters are always strings. So we convert it later
  const parameters = useParams<{ albumID: string }>()

  let album: IAlbum | undefined
  $: {
    getAlbum(Number(albumID)).then((newAlbum) => {
      album = newAlbum
    })
  }

  let source: IPlaySource
  $: source = { origin: "album", sourceID: Number(albumID) }

  // Update the page when the album is changed on navigation
  onMount(
    parameters.subscribe(({ albumID: newAlbumID }) => {
      if (Number(newAlbumID) === albumID) return

      albumID = Number(newAlbumID)
    })
  )

  $: $backgroundImages = album?.cover

  let tracks: readonly ITrack[] = []
  $: tracks = album === undefined ? [] : album?.tracks

  let metadata: IHeroMetaDataItem[]
  $: metadata = [
    {
      label: album?.artist ?? "",
      bold: true,
      to: createArtistURI(album?.artist ?? ""),
    },
    { label: displayTypeWithCount("track", tracks.length) },
  ]

  let buttons: readonly IHeroButton[]
  $: buttons = createDefaultTitleButtons(source)

  $: createContextMenuItems =
    createAddToPlaylistAndQueueMenuItems($playlistsStore)

  const displayOptions: ITrackListDisplayOptions = {
    cover: false,
    album: false,
  }

  async function getAlbum(id: IAlbum["id"]): Promise<IAlbum | undefined> {
    const albumEither: Either<IError, IAlbum> = await window.api.getAlbum({
      where: { id },
      isShuffleOn: false,
    })

    return either.getOrElseW((error) => {
      addNotification({ label: "Failed to get album", duration: 5 })
      console.error(error)

      return undefined
    })(albumEither)
  }
</script>

{#if album}
  <HeroHeading
    title={album.name}
    {metadata}
    image={album.cover}
    type="Album"
    {buttons}
  />

  <TrackList {tracks} {displayOptions} {source} {createContextMenuItems} />
{/if}
