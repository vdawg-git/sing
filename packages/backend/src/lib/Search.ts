/* eslint-disable unicorn/prefer-top-level-await */
import { convertFilepathToFilename } from "@sing-shared/Pures"
import { match as matchEither } from "fp-ts/lib/Either"
import { map as mapArray } from "fp-ts/lib/ReadonlyArray"
import Fuse from "fuse.js"
import log from "ololog"

import { getAlbums, getArtists, getTracks } from "./Crud"

import type {
  IAlbum,
  IArtist,
  IError,
  ISearchItemData,
  ISearchResult,
  ITrack,
} from "@sing-types/Types"

// TODO add release date to album, so that the user can search for albums by it

// TODO use combined keys as the ID for the album (name + artist / albumartist)

// TODO make it possible to play tracks from the search results. Current idea is to play it randomly from "My Tracks" as this does not require an index and a sort order

const searchList = createSearchList()

// The search options
const options: Fuse.IFuseOptions<ISearchItemData> = {
  includeScore: true,
  isCaseSensitive: false,
  findAllMatches: true,
  minMatchCharLength: 2,
  useExtendedSearch: false,
  shouldSort: true,
  keys: [
    { name: "primary", weight: 1 },
    { name: "secondary", weight: 0.5 },
    { name: "tertiary", weight: 0.3 },
  ],
}

export async function search(query: string): Promise<ISearchResult> {
  const fuse = new Fuse(await searchList, options)

  // TODO if score is undefined make it 0 and create a new type for that, so that we dont have to deal with the undefined case all the time

  const raw = fuse.search(query, { limit: 200 })

  const topMatches = getTopMatches(raw)

  const rawWithoutTops = raw.filter((item) => !topMatches.includes(item))

  const artists = rawWithoutTops
    .filter(({ item }) => item.type === "artist")
    .sort(sortByScore)
    .map(({ item, score }) => ({
      name: item.primary,
      image: item.image,
      score,
    }))

  const albums = rawWithoutTops
    .filter(({ item }) => item.type === "album")
    .sort(sortByScore)
    .map(({ item, score }) => ({
      type: "album",
      name: item.primary,
      artist: item.secondary,
      image: item.image,
      score,
    }))

  const tracks = rawWithoutTops
    .filter(({ item }) => item.type === "track")
    .sort(sortByScore)
    .map(({ item, score }) => ({
      type: "track",
      title: item.primary,
      artist: item.secondary,
      album: item.tertiary,
      image: item.image,
      score,
    }))

  // Exclude empty results and return them
  return {
    ...(topMatches.length > 0 && { topMatches }),
    ...(artists.length > 0 && { artists }),
    ...(albums.length > 0 && { albums }),
    ...(tracks.length > 0 && { tracks }),
  }
}

async function createSearchList(): Promise<readonly ISearchItemData[]> {
  const artistItems: readonly ISearchItemData[] = await getArtists().then(
    matchEither(
      logErrorAndReturnEmptyArray("Failed to get artists for createSearchList"),
      mapArray(convertArtistToSearchItem)
    )
  )

  const trackItems: readonly ISearchItemData[] = await getTracks().then(
    matchEither(
      logErrorAndReturnEmptyArray("Failed to get tracks for createSearchList"),
      mapArray(convertTrackToSearchItem)
    )
  )

  const albumItems: readonly ISearchItemData[] = await getAlbums().then(
    matchEither(
      logErrorAndReturnEmptyArray("Failed to get albums for createSearchList"),
      mapArray(convertAlbumToSearchItem)
    )
  )
  // .then(getOrElse(() => []))

  return [...artistItems, ...trackItems, ...albumItems]
}

function sortByScore(
  { score: scoreA }: Fuse.FuseResult<ISearchItemData>,
  { score: scoreB }: Fuse.FuseResult<ISearchItemData>
): number {
  return (scoreA ?? 0) - (scoreB ?? 0)
}

function convertTrackToSearchItem({
  title,
  artist,
  album,
  filepath,
  cover,
}: ITrack): ISearchItemData {
  return {
    type: "track",
    primary: title ?? convertFilepathToFilename(filepath),
    secondary: artist,
    tertiary: album,
    image: cover,
  } as const
}

function convertAlbumToSearchItem({
  name,
  artist,
  cover,
}: IAlbum): ISearchItemData {
  return {
    type: "album",
    primary: name,
    secondary: artist,
    image: cover,
  } as const
}

function convertArtistToSearchItem({ name }: IArtist): ISearchItemData {
  return {
    type: "artist",
    primary: name,
  } as const
}

function logErrorAndReturnEmptyArray(
  errorMessage: string
): // eslint-disable-next-line @typescript-eslint/no-explicit-any
(error: IError) => readonly ISearchItemData[] {
  return (error: IError) => {
    log.error.red(errorMessage, error)
    return []
  }
}

function getTopMatches(
  data: Fuse.FuseResult<ISearchItemData>[]
): readonly Fuse.FuseResult<ISearchItemData>[] {
  const topMatchesMinLength = 3

  const topMatches = [
    ...data
      .slice(topMatchesMinLength + 1)
      .filter(({ score }) => (score ?? 1) < 0.001),
    ...data.slice(0, topMatchesMinLength),
  ]

  return topMatches
}
