<script lang="ts">
  import * as E from "fp-ts/lib/Either"
  import { useNavigate, useParams } from "svelte-navigator"
  import { onMount } from "svelte"

  import { displayTypeWithCount } from "@sing-shared/Pures"

  import { addNotification } from "@/lib/stores/NotificationStore"
  import { playlistsStore } from "@/lib/stores/PlaylistsStore"
  import { convertAlbumToCardData, createDefaultTitleButtons } from "@/Helper"
  import { createAddToPlaylistAndQueueMenuItems } from "@/MenuItemsHelper"

  import CardList from "../organisms/CardList.svelte"
  import { backgroundImages } from "../stores/BackgroundImages"
  import TrackList from "../organisms/TrackList.svelte"

  import HeroHeading from "@/lib/organisms/HeroHeading.svelte"

  import type { IHeroButton, IHeroMetaDataItem } from "@/types/Types"
  import type { IArtistWithAlbumsAndTracks } from "@sing-types/DatabaseTypes"
  import type { IError, IPlaySource } from "@sing-types/Types"
  import type { Either } from "fp-ts/lib/Either"

  export let artistID: string

  // TODO display tracks with unknown album

  const navigate = useNavigate()
  const parameters = useParams<{ artistID: string }>()

  let artist: IArtistWithAlbumsAndTracks | undefined

  $: {
    getArtist(artistID).then((newArtist) => {
      artist = newArtist
    })
  }
  $: tracks = artist?.tracks ?? []
  $: backgroundImages.set(artist?.image)

  // This check is used as an (album)artist like "Various Artist" does not nessecarily have tracks on his owm, but albums
  $: hasTracks = artist !== undefined && tracks.length > 0

  let source: IPlaySource
  $: source = { origin: "artist", sourceID: artistID }

  onMount(
    parameters.subscribe(async ({ artistID: newArtistID }) => {
      // It always fires twice, idk why, so lets prevent the sideffects when it happens
      if (newArtistID === artistID) return

      artistID = newArtistID
    })
  )

  let buttons: IHeroButton[]
  $: buttons = hasTracks ? createDefaultTitleButtons(source) : []

  let metadata: readonly IHeroMetaDataItem[] = hasTracks
    ? [{ label: displayTypeWithCount("track", tracks.length) }]
    : []

  // TODO get albums in which the artist is featured, too
  async function getArtist(albumID: string) {
    const artistEither = (await window.api.getArtist({
      where: { name: albumID },
      isShuffleOn: false,
    })) as Either<IError, IArtistWithAlbumsAndTracks>

    return E.getOrElseW((error) => {
      addNotification({ label: "Failed to get artist", duration: 5 })
      console.log(error)

      return undefined
    })(artistEither)
  }
</script>

{#if artist}
  <HeroHeading title={artistID} {metadata} type="Artist" {buttons} />

  {#if tracks.length > 0}
    <TrackList
      {tracks}
      {source}
      displayOptions={{ artist: false }}
      createContextMenuItems={createAddToPlaylistAndQueueMenuItems(
        $playlistsStore
      )}
    />
    <h2 class="mb-8 -mt-16 text-4xl">Albums</h2>
  {/if}

  {#if artist.albums.length > 0}
    <CardList
      items={artist.albums.map(
        convertAlbumToCardData({ navigate, $playlistsStore })
      )}
      testID="artistCards"
      cardTestAttributes="artistCard"
    />
  {/if}
{/if}
