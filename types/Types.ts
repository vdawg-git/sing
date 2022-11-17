/* eslint-disable @typescript-eslint/no-explicit-any */

import type { FilePath } from "./Filesystem"
import type {
  ITrack,
  IAlbum,
  IPlaylist,
  IArtist,
  IPlaylistTrack,
} from "./DatabaseTypes"
import type { Prisma } from "@prisma/client"
import type { app } from "electron"
import type { Either } from "fp-ts/lib/Either"
import type * as mm from "music-metadata"
import type { StrictExclude, StrictExtract } from "ts-essentials"
import type { CamelCase, ReadonlyDeep, SetOptional } from "type-fest"
import type { SvelteComponentDev } from "svelte/internal"

export type ISyncResult = Either<
  IError,
  {
    readonly tracks: readonly ITrack[]
    readonly artists: readonly IArtist[]
    readonly albums: readonly IAlbum[]
  }
>

export type IElectronPaths = Parameters<typeof app.getPath>[0]

interface PreIRawAudioMetadata_ extends mm.IAudioMetadata {
  readonly filepath: FilePath
}

export type IRawAudioMetadata = ReadonlyDeep<PreIRawAudioMetadata_>

export interface IRawAudioMetadataWithPicture extends IRawAudioMetadata {
  readonly common: IRawAudioMetadata["common"] & {
    picture: readonly mm.IPicture[]
  }
}

export interface INotificationBase {
  readonly id: symbol
  readonly label: string
  readonly type?: INotificationTypes
  readonly duration?: number
}

export type INotification = SetOptional<INotificationBase, "id">

export type INotificationTypes =
  | "check"
  | "danger"
  | "default"
  | "loading"
  | "warning"

export type IErrorTypes =
  | "Array is empty"
  | "Directory read failed"
  | "Failed to add items to playlist"
  | "Failed to add track to database"
  | "Failed to create playlist at database"
  | "Failed to delete playlist at database"
  | "Failed to edit playlist description"
  | "Failed to get album from database"
  | "Failed to get albums from database"
  | "Failed to get artist from database"
  | "Failed to get artists from database"
  | "Failed to get cover from database"
  | "Failed to get covers from database"
  | "Failed to get playlist from database"
  | "Failed to get playlist names"
  | "Failed to get playlists from database"
  | "Failed to get tracks from albums"
  | "Failed to get tracks from artists"
  | "Failed to get tracks from database"
  | "Failed to get tracks from playlists"
  | "Failed to remove unused albums from the database"
  | "Failed to remove unused artists from the database"
  | "Failed to remove unused covers from the database"
  | "Failed to remove unused tracks from the database"
  | "Failed to rename playlist at database"
  | "Failed to update playlist"
  | "File deletion failed"
  | "File metadata parsing failed"
  | "File write failed"
  | "Invalid arguments"
  | "Path not accessible"

export interface IError {
  readonly type: IErrorTypes
  readonly error: Error | unknown
  readonly message?: string
}

export interface IErrorInvalidArguments extends IError {
  readonly type: "Invalid arguments"
}
export interface IErrorArrayIsEmpty extends IError {
  readonly type: "Array is empty"
}
export interface IErrorFSDirectoryReadFailed extends IError {
  readonly type: "Directory read failed"
}
export interface IErrorFSPathUnaccessible extends IError {
  readonly type: "Path not accessible"
}
export interface IErrorFSDeletionFailed extends IError {
  readonly type: "File deletion failed"
}
export interface IErrorFSWriteFailed extends IError {
  readonly type: "File write failed"
}
export interface IErrorMMDParsingError extends IError {
  readonly type: "File metadata parsing failed"
}

/**
 * The possible sources which can be used as a playback
 */
export type IPlaySource =
  | CamelCase<StrictExtract<Prisma.ModelName, "Artist" | "Album" | "Playlist">>
  | `all${StrictExtract<Prisma.ModelName, "Track">}s`

export type ISortOrder = "ascending" | "descending"

/**
 * The sort options for the different pages.
 * Like albums can be sorted by name (in the future also by release data) and tracks can be sorted by a much bigger variety of options
 */
export type ISortOptions = makeSortOptions<SortableMusicItems>

/**
 * Which items can be sorted and how should they be able to be sorted.
 * Does not only include items meant for playback, but also just for display purposes.
 *
 * Like for example how can "artists" be sorted (currently there is no way to play back all artists)
 *
 * This is used by {@link ISortOptions}.
 */
type SortableMusicItems = {
  album: ITrackSortKeys
  albums: StrictExtract<keyof IAlbum, "name">
  artist: ITrackSortKeys
  artists: StrictExtract<keyof IArtist, "name">
  playlist: IPlaylistTrackSortKeys
  playlists: StrictExtract<keyof IPlaylist, "name">
  tracks: ITrackSortKeys
}

type makeSortOptions<T extends Record<string, string>> = {
  readonly [key in keyof T]: readonly [T[key], ISortOrder]
}

/**
 * The keys of a track available to sort
 */
export type ITrackSortKeys = StrictExtract<
  keyof ITrack,
  "album" | "artist" | "duration" | "title" | "trackNo"
>

/**
 * The keys available to sort tracks in a playlist.
 */
export type IPlaylistTrackSortKeys =
  | ITrackSortKeys
  | StrictExtract<keyof IPlaylistTrack, "manualOrderIndex">

// TODO makes albums sortable by release date. Low priority though

export type IPlayback = validatePlayback<
  | {
      readonly source: StrictExtract<IPlaySource, "album">
      // The queue only has tracks to be sorted
      readonly sortBy: ISortOptions["tracks"]

      // The ID of the source to be played. For example, an album id.
      readonly sourceID: string

      readonly isShuffleOn: boolean
    }
  | {
      readonly source: StrictExtract<IPlaySource, "allTracks">
      readonly sortBy: ISortOptions["tracks"]
      readonly isShuffleOn: boolean

      // Does not need an ID, as it is just all tracks
    }
  | {
      readonly source: StrictExtract<IPlaySource, "playlist">
      readonly sortBy: ISortOptions["playlist"]
      readonly sourceID: number
      readonly isShuffleOn: boolean
    }
  | {
      readonly source: StrictExtract<IPlaySource, "artist">
      readonly sortBy: ISortOptions["artist"]
      readonly sourceID: string
      readonly isShuffleOn: boolean
    }
>

export type INewPlayback = SetOptional<IPlayback, "isShuffleOn">

// const _: INewPlayback = "" as unknown as INewPlayback

// if (_.source === "playlist") {
//   _.sortBy
// }

type validatePlayback<T extends { source: IPlaySource }> = T

/**
 * The search results from the backend to the renderer.
 * Keys without results do not get included
 */
export type ISearchResult = {
  readonly topMatches?: readonly ISearchedData[]

  readonly artists?: readonly ISearchedArtist[]

  readonly albums?: readonly ISearchedAlbum[]

  readonly tracks?: readonly ISearchedTrack[]
}

export type ISearchedArtist = { type: "artist"; item: IArtist; score: number }
export type ISearchedAlbum = { type: "album"; item: IAlbum; score: number }
export type ISearchedTrack = { type: "track"; item: ITrack; score: number }
export type ISearchedData = ISearchedArtist | ISearchedAlbum | ISearchedTrack

/**
 * The text to display below the title of the search result item.
 * The label is the title / label.
 * The onClick is for the case the user clicks on it.
 */
export type ISearchItemSubtext = {
  readonly label: string
  readonly onClick?: () => void
}

export type ISearchResultItem = {
  readonly image?: FilePath
  readonly isImageCircle?: boolean // Only needed for artist currently
  readonly title: string
  readonly label?: string // Only needed for topMatches "album" and "track"
  readonly subtexts: readonly ISearchItemSubtext[]
  readonly onClick: () => void
  readonly icon: typeof SvelteComponentDev
}

export type IConvertedSearchData = Readonly<
  StrictExclude<
    {
      [Key in keyof ISearchResult]: [
        Key,
        Exclude<ISearchResult[Key], undefined>
      ]
    }[keyof ISearchResult],
    undefined
  >
>
