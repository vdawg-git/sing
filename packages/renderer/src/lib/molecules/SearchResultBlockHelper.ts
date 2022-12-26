import { match, P } from "ts-pattern"
import IconArrowRight from "virtual:icons/heroicons/arrow-right"
import IconPlay from "virtual:icons/heroicons/play"

import { convertFilepathToFilename } from "@sing-shared/Pures"

import { createAlbumURI, createArtistURI, ROUTES } from "@/Routes"
import { playTrackAsShuffledTracks } from "@/lib/manager/player"

import type { IAlbum, IArtist, ITrack } from "@sing-types/DatabaseTypes"
import type {
  IConvertedSearchData,
  ISearchItemSubtext,
  ISearchResultItem,
} from "@sing-types/Types"
import type { NavigateFn } from "svelte-navigator"

// const navigate = useNavigate()

/**
 *
 * @param navigate The navigate hook to use for navigation.
 * @param data The search result data for this block.
 * @returns The converted data, ready to be displayed.
 */
export function convertSearchedDataToSearchItems(
  navigate: NavigateFn,
  data: IConvertedSearchData
): readonly ISearchResultItem[] {
  return match(data)
    .with(["topMatches", P.select()], (topMatches) =>
      topMatches.map((item) =>
        match(item)
          .with({ type: "artist" }, ({ item: artist }) =>
            convertArtistToSearchItem(navigate, artist)
          )
          .with({ type: "album" }, ({ item: album }) =>
            convertAlbumToSearchItem(navigate, album, "album")
          )
          .with({ type: "track" }, ({ item: track }) =>
            convertTrackToSearchItem(navigate, track, "track")
          )
          .exhaustive()
      )
    )
    .with(["artists", P.select()], (artists) =>
      artists.map(({ item: artist }) =>
        convertArtistToSearchItem(navigate, artist)
      )
    )
    .with(["albums", P.select()], (albums) =>
      albums.map(({ item: album }) => convertAlbumToSearchItem(navigate, album))
    )
    .with(["tracks", P.select()], (tracks) =>
      tracks.map(({ item: track }) => convertTrackToSearchItem(navigate, track))
    )
    .exhaustive()
}

function convertTrackToSearchItem(
  navigate: (route: string) => void,
  track: ITrack,
  label?: string
): ISearchResultItem {
  const subtexts = createTrackSubtexts(navigate, track)

  return {
    title: track.title ?? convertFilepathToFilename(track.filepath),
    subtexts,
    image: track.cover,
    label,
    icon: IconPlay,
    onClick: async () => playTrackAsShuffledTracks(track),
  }
}

function convertAlbumToSearchItem(
  navigate: NavigateFn,
  album: IAlbum,
  label?: string
): ISearchResultItem {
  const subtexts = createAlbumSubtexts(navigate, album?.artistEntry)

  return {
    title: album.name,
    image: album.cover,
    subtexts,
    icon: IconArrowRight,
    label,
    onClick: async () => navigate(createAlbumURI(album.id)),
  }
}

function convertArtistToSearchItem(
  navigate: NavigateFn,
  artist: IArtist,
  label?: string
): ISearchResultItem {
  return {
    title: artist.name,
    subtexts: [{ label: "Artist" }],
    isImageCircle: true,
    icon: IconArrowRight,
    label,
    onClick: () => {
      navigate(createArtistURI(artist.name))
    },
  }
}
function createAlbumSubtexts(
  navigate: NavigateFn,
  albumArtist: IArtist | undefined
): ISearchItemSubtext[] {
  return albumArtist
    ? [
        {
          label: albumArtist.name,
          onClick: async () => navigate(createArtistURI(albumArtist.name)),
        },
      ]
    : [{ label: "Unknown" }]
}

function createTrackSubtexts(
  navigate: (route: string) => void,
  { album, artist }: ITrack
): readonly ISearchItemSubtext[] {
  const albumItem: ISearchItemSubtext | undefined = album
    ? {
        label: album,
        onClick: async () => navigate(`${ROUTES.albums}/${album}`),
      }
    : undefined

  const artistItem: ISearchItemSubtext | undefined = artist
    ? {
        label: artist,
        onClick: async () => navigate(createArtistURI(artist)),
      }
    : undefined

  return [
    ...(albumItem ? [albumItem] : []),
    ...(artistItem ? [artistItem] : []),
  ]
}
