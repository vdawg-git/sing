/* eslint-disable unicorn/prefer-top-level-await */
import { convertFilepathToFilename } from "@sing-shared/Pures"
import * as E from "fp-ts/lib/Either"
import { map as mapArray } from "fp-ts/lib/ReadonlyArray"
import Fuse from "fuse.js"
import log from "ololog"
import { match } from "ts-pattern"

import { getAlbums, getArtists, getTracks } from "./Crud"

import type {
  IAlbum,
  IArtist,
  IError,
  ISearchResult,
  ITrack,
  ISearchedData,
  ISearchedTrack,
  ISearchedArtist,
  ISearchedAlbum,
} from "@sing-types/Types"

import type { IToSearchData } from "@/types/Types"

// TODO add release date to album, so that the user can search for albums by it

// TODO use combined keys as the ID for the album (name + artist / albumartist)

// TODO make it possible to play tracks from the search results. Current idea is to play it randomly from "My Tracks" as this does not require an index and a sort order

const searchList = createSearchList()

/**
 * The search options for tje Fuse.js, ultimately used by the {@link search} function
 */
const options: Fuse.IFuseOptions<IToSearchData> = {
  includeScore: true,
  isCaseSensitive: false,
  findAllMatches: true,
  useExtendedSearch: false,
  ignoreLocation: true,
  shouldSort: true,
  fieldNormWeight: 0.5,
  threshold: 0.3,
  keys: [
    { name: "primary", weight: 1 },
    { name: "secondary", weight: 0.3 },
    { name: "tertiary", weight: 0.1 },
  ],
}

export async function search(query: string): Promise<ISearchResult> {
  const results: readonly ISearchedData[] = await getSearchResults(
    searchList,
    query
  )

  const topMatches = getTopMatches(results)

  const resultsWithoutTops = results.filter(
    (item) => !topMatches.includes(item)
  )

  const artists: readonly ISearchedArtist[] = resultsWithoutTops
    .flatMap((item) => (item.type === "artist" ? item : []))
    .sort((item) => sortByScore(item, item))

  const albums: readonly ISearchedAlbum[] = resultsWithoutTops
    .flatMap((item) => (item.type === "album" ? item : []))
    .sort(sortByScore)

  const tracks: readonly ISearchedTrack[] = resultsWithoutTops
    .flatMap((item) => (item.type === "track" ? item : []))
    .sort(sortByScore)

  // Return result, but exclude keys with an empty array
  return {
    ...(topMatches.length > 0 && { topMatches }),
    ...(artists.length > 0 && { artists }),
    ...(albums.length > 0 && { albums }),
    ...(tracks.length > 0 && { tracks }),
  }
}

/**
 * Create a list of data from the database to be searched for by {@link search}
 * @returns The data to be searched
 */
async function createSearchList(): Promise<readonly IToSearchData[]> {
  const artistItems: readonly IToSearchData[] = await getArtists().then(
    E.match(
      logErrorAndReturnEmptyArray("Failed to get artists for createSearchList"),
      mapArray(convertArtistToSearchItem)
    )
  )

  const trackItems: readonly IToSearchData[] = await getTracks().then(
    E.match(
      logErrorAndReturnEmptyArray("Failed to get tracks for createSearchList"),
      mapArray(convertTrackToSearchItem)
    )
  )

  const albumItems: readonly IToSearchData[] = await getAlbums().then(
    E.match(
      logErrorAndReturnEmptyArray("Failed to get albums for createSearchList"),
      mapArray(convertAlbumToSearchItem)
    )
  )

  return [...artistItems, ...trackItems, ...albumItems]
}

/**
 * Get fussy search results from the {@link dataToSearchFrom}
 * @param query The query to search for
 * @returns
 */
async function getSearchResults(
  dataToSearchFrom: Promise<readonly IToSearchData[]>,
  query: string
): Promise<ISearchedData[]> {
  // TODO Search list is currently defined in the module scope and is static. Make it refresh when the library is updated

  const fuse = new Fuse(await dataToSearchFrom, options)

  return fuse
    .search(query, { limit: 500 })
    .filter(({ score }) => (score ?? 100) < 0.4)
    .map(({ item, score }) =>
      match(item)
        .with(
          { type: "artist" },
          ({ artist }) =>
            ({
              type: "artist",
              item: artist,
              score: score ?? 100,
            } as const)
        )
        .with(
          { type: "album" },
          ({ album }) =>
            ({
              type: "album",
              item: album,
              score: score ?? 100,
            } as const)
        )
        .with(
          { type: "track" },
          ({ track }) =>
            ({
              type: "track",
              item: track,
              score: score ?? 100,
            } as const)
        )
        .exhaustive()
    )
}

/**
 * To be used with `Array.sort()`
 */
function sortByScore(
  { score: scoreA }: { readonly score: number },
  { score: scoreB }: { readonly score: number }
): number {
  return (scoreA ?? 0) - (scoreB ?? 0)
}

function convertTrackToSearchItem(track: ITrack): IToSearchData {
  return {
    type: "track",
    primary: track.title ?? convertFilepathToFilename(track.filepath),
    secondary: track.artist,
    tertiary: track.album,
    track,
  } as const
}

function convertAlbumToSearchItem(album: IAlbum): IToSearchData {
  return {
    type: "album",
    primary: album.name,
    secondary: album.artist,
    album,
  } as const
}

function convertArtistToSearchItem(artist: IArtist): IToSearchData {
  return {
    type: "artist",
    primary: artist.name,
    artist,
  } as const
}

function logErrorAndReturnEmptyArray(
  errorMessage: string
): // eslint-disable-next-line @typescript-eslint/no-explicit-any
(error: IError) => readonly IToSearchData[] {
  return (error: IError) => {
    log.error.red(errorMessage, error)
    return []
  }
}

function getTopMatches(
  data: readonly ISearchedData[]
): readonly ISearchedData[] {
  const topMatchesMinLength = 3

  const topMatches = [...data.slice(0, topMatchesMinLength)]
    .filter(({ score }) => score < 0.09)
    .sort(sortByScore)

  return topMatches
}
