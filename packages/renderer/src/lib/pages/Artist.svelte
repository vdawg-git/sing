<script lang="ts">
  import { onMount } from "svelte"
  import { either } from "fp-ts"
  import IconPlay from "virtual:icons/heroicons-outline/play"
  import IconShuffle from "virtual:icons/eva/shuffle-2-outline"
  import HeroHeading from "@/lib/organisms/HeroHeading.svelte"
  import { addNotification } from "@/lib/stores/NotificationStore"

  import type {
    IArtistWithAlbumsAndTracks,
    IError,
    ITracksSource,
  } from "@sing-types/Types"
  import type { IHeroAction } from "@/types/Types"
  import type { Either } from "fp-ts/lib/Either"
  import { player } from "../manager/player"
  import CardList from "../organisms/CardList.svelte"
  import { useNavigate } from "svelte-navigator"
  import { ROUTES } from "@/Consts"

  export let artistID: string

  const navigate = useNavigate()

  let artist: IArtistWithAlbumsAndTracks | undefined = undefined

  const sourceType: ITracksSource = "artists"

  const actions: IHeroAction[] = [
    {
      label: "Play",
      icon: IconPlay,
      callback: () =>
        player.playFromSource({
          type: sourceType,
          id: artistID,
          sort: ["album", "ascending"],
        }),
      primary: true,
    },
    { label: "Shuffle", icon: IconShuffle, callback: () => {}, primary: false },
  ]

  onMount(async () => {
    artist = await getArtist(artistID)
  })

  async function getArtist(albumID: string) {
    const albumEither = (await window.api.getArtistWithAlbumsAndTracks({
      where: { name: albumID },
      include: { tracks: true },
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
        label: `${artist.tracks.length} tracks${
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
      player.playFromSource({
        type: "albums",
        id,
        sort: ["trackNo", "ascending"],
      })}
    on:clickedPrimary={({ detail: id }) => navigate(`/${ROUTES.albums}/${id}`)}
  />
{/if}
