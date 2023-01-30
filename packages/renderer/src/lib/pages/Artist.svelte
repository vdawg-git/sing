<script lang="ts">
  import * as E from "fp-ts/lib/Either"
  import { useNavigate, useParams } from "svelte-navigator"
  import IconShuffle from "virtual:icons/eva/shuffle-2-outline"
  import IconPlay from "virtual:icons/heroicons/play"
  import { onMount } from "svelte"

  import { displayTypeWithCount } from "@sing-shared/Pures"

  import { addNotification } from "@/lib/stores/NotificationStore"
  import { playNewSource } from "@/lib/manager/player"
  import { playlistsStore } from "@/lib/stores/PlaylistsStore"
  import { convertAlbumToCardData } from "@/Helper"
  import { createAddToPlaylistAndQueueMenuItems } from "@/MenuItemsHelper"

  import CardList from "../organisms/CardList.svelte"
  import { backgroundImages } from "../stores/BackgroundImages"
  import TrackList from "../organisms/TrackList.svelte"

  import HeroHeading from "@/lib/organisms/HeroHeading.svelte"

  import type { IHeroAction, IHeroMetaDataItem } from "@/types/Types"
  import type { IArtistWithAlbumsAndTracks } from "@sing-types/DatabaseTypes"
  import type { IError, ISortOptions } from "@sing-types/Types"
  import type { Either } from "fp-ts/lib/Either"

  export let artistID: string

  // TODO display tracks with unknown album

  const navigate = useNavigate()
  const parameters = useParams<{ artistID: string }>()

  const baseSource = { source: "artist" as const, sourceID: artistID }

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

  onMount(
    parameters.subscribe(async ({ artistID: newArtistID }) => {
      // It always fires twice, idk why, so lets prevent the sideffects when it happens
      if (newArtistID === artistID) return

      artistID = newArtistID
    })
  )

  const sortBy: ISortOptions["tracks"] = ["album", "ascending"]

  let actions: IHeroAction[]
  $: actions = hasTracks
    ? [
        {
          label: "Play",
          icon: IconPlay,
          callback: async () =>
            playNewSource({
              ...baseSource,
              sortBy: ["album", "ascending"],
              isShuffleOn: false,
              index: 0,
            }),
          primary: true,
        },
        {
          label: "Shuffle",
          icon: IconShuffle,
          callback: async () =>
            playNewSource({
              ...baseSource,
              sortBy: ["album", "ascending"],
              isShuffleOn: true,
              index: 0,
            }),
          primary: false,
        },
      ]
    : []

  let metadata: readonly IHeroMetaDataItem[] = hasTracks
    ? [
        {
          label: displayTypeWithCount("track", tracks.length),
        },
      ]
    : []

  // TODO get albums in which the artist is featured, too
  async function getArtist(albumID: string) {
    const artistEither = (await window.api.getArtist({
      where: { name: albumID },
      sortBy,
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
  <HeroHeading
    title={artistID}
    {metadata}
    type="Artist"
    {actions}
    titleTestID="artistHeroTitle"
  />

  {#if tracks.length > 0}
    <TrackList
      {tracks}
      sort={sortBy}
      displayOptions={{ artist: false }}
      createContextMenuItems={createAddToPlaylistAndQueueMenuItems(
        $playlistsStore
      )}
      on:play={async ({ detail }) =>
        playNewSource({
          ...baseSource,
          sortBy,
          index: detail.index,
          firstTrack: detail.track,
        })}
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
