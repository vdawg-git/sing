<script lang="ts">
  import IconPlay from "virtual:icons/heroicons-outline/play"
  import IconShuffle from "virtual:icons/eva/shuffle-2-outline"
  import HeroHeading from "@/lib/organisms/HeroHeading.svelte"
  import CardList from "../organisms/CardList.svelte"

  import { either } from "fp-ts"
  import { useNavigate, useParams } from "svelte-navigator"
  import { playNewSource } from "../manager/player"
  import { addNotification } from "@/lib/stores/NotificationStore"
  import { ROUTES } from "@/Consts"

  import type {
    IArtistWithAlbumsAndTracks,
    IError,
    ITracksSource,
  } from "@sing-types/Types"
  import type { IHeroAction } from "@/types/Types"
  import type { Either } from "fp-ts/lib/Either"
  import { backgroundImagesStore } from "../stores/BackgroundImages"

  export let artistID: string

  // TODO display tracks with unknown album

  const navigate = useNavigate()
  const params = useParams<{ artistID: string }>()

  let artist: IArtistWithAlbumsAndTracks | undefined = undefined

  params.subscribe(async ({ artistID }) => {
    artist = await getArtist(artistID)
    console.log({ artist })

    backgroundImagesStore.set(artist?.image)
  })

  const sourceType: ITracksSource = "artists"

  let actions: IHeroAction[]
  $: actions = [
    {
      label: "Play",
      icon: IconPlay,
      callback: () =>
        playNewSource({
          source: sourceType,
          sourceID: artistID,
          sort: ["album", "ascending"],
        }),
      primary: true,
    },
    { label: "Shuffle", icon: IconShuffle, callback: () => {}, primary: false },
  ]

  async function getArtist(albumID: string) {
    const albumEither = (await window.api.getArtist({
      where: { name: albumID },
    })) as Either<IError, IArtistWithAlbumsAndTracks>

    return either.getOrElseW((error) => {
      addNotification({ label: "Failed to get artist", duration: 5 })
      console.log(error)

      return undefined
    })(albumEither)
  }
</script>

{#if artist}
  <HeroHeading
    title={artistID}
    metadata={[
      {
        label: `${artist.tracks.length} track${
          artist.tracks.length > 1 ? "s" : ""
        }`,
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
        source: "albums",
        sourceID: id,
        sort: ["trackNo", "ascending"],
      })}
    on:clickedPrimary={({ detail: id }) => navigate(`/${ROUTES.albums}/${id}`)}
  />
{/if}
