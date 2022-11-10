<script lang="ts">
  import { either } from "fp-ts"
  import { useNavigate, useParams } from "svelte-navigator"
  import IconShuffle from "virtual:icons/eva/shuffle-2-outline"
  import IconPlay from "virtual:icons/heroicons-outline/play"

  import type { IError, INewPlayback } from "@sing-types/Types"
  import type { IArtistWithAlbumsAndTracks } from "@sing-types/DatabaseTypes"
  import { displayTypeWithCount } from "@sing-shared/Pures"

  import { ROUTES } from "@/Consts"
  import { addNotification } from "@/lib/stores/NotificationStore"
  import type { IHeroAction } from "@/types/Types"

  import { playNewSource } from "../manager/player"
  import CardList from "../organisms/CardList.svelte"
  import { backgroundImages } from "../stores/BackgroundImages"

  import HeroHeading from "@/lib/organisms/HeroHeading.svelte"

  import type { Either } from "fp-ts/lib/Either"

  export let artistID: string

  // TODO display tracks with unknown album

  const navigate = useNavigate()
  const parameters = useParams<{ artistID: string }>()

  let artist: IArtistWithAlbumsAndTracks | undefined = undefined

  parameters.subscribe(async ({ artistID: newArtistID }) => {
    artist = await getArtist(newArtistID)

    backgroundImages.set(artist?.image)
  })

  const source: INewPlayback = {
    source: "artist" as const,
    sourceID: artistID,
    sortBy: ["album", "ascending"],
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

  async function getArtist(albumID: string) {
    const artistEither = (await window.api.getArtist({
      where: { name: albumID },
      sortBy: ["album", "ascending"],
      isShuffleOn: false,
    })) as Either<IError, IArtistWithAlbumsAndTracks>

    return either.getOrElseW((error) => {
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

  <CardList
    items={artist.albums.map((album) => ({
      title: album.name,
      id: album.name,
      image: album.cover,
      secondaryText: album.artist,
    }))}
    on:play={({ detail: id }) =>
      playNewSource({
        source: "album",
        sourceID: id,
        sortBy: ["trackNo", "ascending"],
      })}
    on:clickedPrimary={({ detail: id }) => navigate(`/${ROUTES.albums}/${id}`)}
  />
{/if}
