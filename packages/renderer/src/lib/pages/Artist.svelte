<script lang="ts">
  import { onMount } from "svelte"
  import { either } from "fp-ts"
  import IconPlay from "virtual:icons/heroicons-outline/play"
  import IconShuffle from "virtual:icons/eva/shuffle-2-outline"
  import HeroHeading from "@/lib/organisms/HeroHeading.svelte"
  import { addNotification } from "@/lib/stores/NotificationStore"

  import type { IArtistWithTracks, IError } from "@sing-types/Types"
  import type {
    IHeroAction,
    ISourceType,
    ITrackListDisplayOptions,
  } from "@/types/Types"
  import type { Either } from "fp-ts/lib/Either"
  import TrackList from "../organisms/TrackList.svelte"

  export let artistID: string

  let artist: IArtistWithTracks | undefined = undefined

  const sourceType: ISourceType = "ALBUM"

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
    artist = await getArtist(artistID)
  })

  const displayOptions: ITrackListDisplayOptions = {
    cover: false,
    album: false,
  }

  async function getArtist(albumID: string) {
    const albumEither = (await window.api.getArtist({
      where: { name: albumID },
      include: { tracks: true },
    })) as Either<IError, IArtistWithTracks>

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

  <TrackList
    testID="trackItems"
    {sourceType}
    tracks={artist.tracks}
    {displayOptions}
  />
{/if}
