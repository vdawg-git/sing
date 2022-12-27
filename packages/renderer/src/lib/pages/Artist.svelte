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
  import {
    convertAlbumToCardData,
    createAddToPlaylistAndQueueMenuItems,
  } from "@/Helper"
  import { TEST_IDS } from "@/TestConsts"

  import CardList from "../organisms/CardList.svelte"
  import { backgroundImages } from "../stores/BackgroundImages"
  import TrackList from "../organisms/TrackList.svelte"

  import HeroHeading from "@/lib/organisms/HeroHeading.svelte"

  import type { IHeroAction } from "@/types/Types"
  import type { IArtistWithAlbumsAndTracks } from "@sing-types/DatabaseTypes"
  import type { IError, INewPlayback, ISortOptions } from "@sing-types/Types"
  import type { Either } from "fp-ts/lib/Either"

  export let artistID: string

  // TODO display tracks with unknown album

  const navigate = useNavigate()
  const parameters = useParams<{ artistID: string }>()

  let artist: IArtistWithAlbumsAndTracks | undefined = undefined
  $: {
    getArtist(artistID).then((newArtist) => {
      artist = newArtist
    })
  }
  $: tracks = artist?.tracks ?? []
  $: backgroundImages.set(artist?.image)

  $: console.log("🚀 ~ file: Artist.svelte:36 ~ artist", artist)

  onMount(
    parameters.subscribe(async ({ artistID: newArtistID }) => {
      // It always fires twice, idk why, so lets prevent the sideffects when it happens
      if (newArtistID === artistID) return

      artistID = newArtistID
    })
  )

  const sortBy: ISortOptions["tracks"] = ["album", "ascending"]
  const source: INewPlayback = {
    source: "artist" as const,
    sourceID: artistID,
    sortBy,
  }

  let actions: IHeroAction[]
  $: actions = [
    {
      label: "Play",
      icon: IconPlay,
      callback: async () =>
        playNewSource({
          ...source,
          isShuffleOn: false,
        }),
      primary: true,
    },
    {
      label: "Shuffle",
      icon: IconShuffle,
      callback: async () =>
        playNewSource({
          ...source,
          isShuffleOn: true,
        }),
      primary: false,
    },
  ]

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
    metadata={[
      {
        label: displayTypeWithCount("track", artist.tracks.length),
      },
    ]}
    type="Artist"
    {actions}
  />

  <TrackList
    {tracks}
    sort={sortBy}
    displayOptions={{ artist: false }}
    createContextMenuItems={createAddToPlaylistAndQueueMenuItems(
      $playlistsStore
    )}
    testID={TEST_IDS.trackItems}
    on:play={async ({ detail }) => playNewSource(source, detail.index)}
  />

  <h2 class="mb-8 -mt-16 text-4xl">Albums</h2>

  {#if artist.albums.length > 0}
    <CardList
      items={artist.albums.map(
        convertAlbumToCardData({ navigate, $playlistsStore })
      )}
    />
  {/if}
{/if}
