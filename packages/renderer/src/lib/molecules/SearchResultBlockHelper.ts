import { ROUTES } from "@/Consts"
import { convertFilepathToFilename } from "@sing-shared/Pures"
import { match, P } from "ts-pattern"
import IconArrowRight from "virtual:icons/heroicons-outline/arrow-right"
import IconPlay from "virtual:icons/heroicons-outline/play"

import type {
  IAlbum,
  IArtist,
  IConvertedSearchData,
  ISearchItemSubtext,
  ISearchResultItem,
  ITrack,
} from "@sing-types/Types"

import type {} from "@/types/Types"
// const navigate = useNavigate()

export function convertSearchedDataToSearchItems(
  navigate: (route: string) => void,
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
    onClick() {
      console.error(`Not implemented yet`)
    },
  }
}

function convertAlbumToSearchItem(
  navigate: (route: string) => void,
  album: IAlbum,
  label?: string
): ISearchResultItem {
  const subtexts = createAlbumSubtexts(navigate, album?.artist)

  return {
    title: album.name,
    image: album.cover,
    subtexts,
    icon: IconArrowRight,
    label,
    onClick() {
      navigate(`${ROUTES.albums}/${album.name}`)
    },
  }
}

function convertArtistToSearchItem(
  navigate: (route: string) => void,
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
      navigate(`${ROUTES.artists}/${artist.name}`)
    },
  }
}

function createAlbumSubtexts(
  navigate: (route: string) => void,
  albumArtist: string | undefined
): ISearchItemSubtext[] {
  return albumArtist
    ? [
        {
          label: albumArtist,
          onClick: () => navigate(`${ROUTES.artists}/${albumArtist}`),
        },
      ]
    : [{ label: "Unknown" }]
}

function createTrackSubtexts(
  navigate: (route: string) => void,
  { album, artist }: ITrack
): readonly ISearchItemSubtext[] {
  const albumItem: ISearchItemSubtext | undefined = album
    ? { label: album, onClick: () => navigate(`${ROUTES.albums}/${album}`) }
    : undefined

  const artistItem: ISearchItemSubtext | undefined = artist
    ? {
        label: artist,
        onClick: () => navigate(`${ROUTES.artists}/${artist}`),
      }
    : undefined

  return [
    ...(albumItem ? [albumItem] : []),
    ...(artistItem ? [artistItem] : []),
  ]
}
