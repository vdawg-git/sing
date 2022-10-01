/* eslint-disable @typescript-eslint/no-explicit-any */

import type { app } from "electron"
import type * as mm from "music-metadata"
import type { CamelCase, ReadonlyDeep, SetOptional } from "type-fest"
import type { Either } from "fp-ts/lib/Either"
import type {
  Prisma,
  Track,
  Album,
  Artist,
  Cover,
  Playlist,
} from "@prisma/client"
import type { DeepReadonlyNullToUndefined, OnlyKeysOf } from "./Utilities"
import type { FilePath } from "./Filesystem"
import type { StrictExclude, StrictExtract } from "ts-essentials"
import type { SvelteComponentDev } from "svelte/internal"

export type ITrack = DeepReadonlyNullToUndefined<Track> & {
  readonly filepath: FilePath
  readonly cover?: FilePath
}

export type IAlbum = DeepReadonlyNullToUndefined<Album> &
  OnlyKeysOf<
    Prisma.AlbumGetPayload<{
      include: { tracks: true }
    }>,
    {
      cover?: FilePath
      tracks: readonly ITrack[]
    }
  >

export type IArtist = DeepReadonlyNullToUndefined<Artist> &
  OnlyKeysOf<
    Prisma.ArtistGetPayload<{
      include: { albums: true; tracks: true }
    }>,
    {
      readonly albums: readonly IAlbum[]
      readonly image?: FilePath
    }
  >

export type IArtistWithAlbumsAndTracks = IArtist &
  OnlyKeysOf<
    Prisma.ArtistGetPayload<{
      include: { tracks: true; albums: true }
    }>,
    {
      readonly albums: readonly IAlbum[]
      readonly tracks: readonly ITrack[]
    }
  >

export type IDBModels = IArtist | IAlbum | ITrack

export type ICover = DeepReadonlyNullToUndefined<Cover> &
  OnlyKeysOf<
    Cover,
    {
      readonly filepath: FilePath
    }
  >

export type ISyncResult = Either<
  IError,
  {
    readonly tracks: readonly ITrack[]
    readonly artists: readonly IArtist[]
    readonly albums: readonly IAlbum[]
  }
>

export type IPlaylist = Playlist

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
  | "Failed to add track to database"
  | "Failed to get from database"
  | "Failed to remove unused albums from the database"
  | "Failed to remove unused artists from the database"
  | "Failed to remove unused covers from the database"
  | "Failed to remove unused tracks from the database"
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

export type IPlaySources = `${CamelCase<
  StrictExtract<Prisma.ModelName, "Artist" | "Album" | "Track" | "Playlist">
>}s`

export type ISortOrder = "ascending" | "descending"

type makeSortOptions<T extends Record<IPlaySources, string>> = {
  readonly [key in IPlaySources]: readonly [T[key], ISortOrder]
}

/**
 * The keys of a track available to sort
 */
export type ITrackSortKeys = StrictExtract<
  keyof ITrack,
  "album" | "artist" | "duration" | "title" | "trackNo"
>

// TODO makes albums sortable by release date
/**
 * The sort options for the different pages.
 * Like albums can be sorted by name (in the future also by release data) and tracks can be sorted a much bigger variety of options
 */
export type ISortOptions = makeSortOptions<{
  albums: StrictExtract<keyof IAlbum, "name">
  tracks: ITrackSortKeys
  artists: StrictExtract<keyof IArtist, "name">
  playlists: StrictExtract<keyof IPlaylist, "name">
}>

/**
 * The new playback generated from the renderer by user interaction.
 * If the type is "tracks", the sourceID is not needed
 */
export type IPlayback =
  | {
      readonly [Source in IPlaySources as Source extends StrictExtract<
        IPlaySources,
        "tracks"
      >
        ? never
        : Source]: {
        readonly source: Source
        // Only tracks need to be sorted for the queue
        readonly sortBy: ISortOptions["tracks"]

        // The ID of the source to be played. For example, an album id. If the source is all tracks, which would be type {type: "tracks"}, then this field is not needed as the type already induces this.
        // So in this case, typing something like "ALL_TRACKS" to clarify the source.
        readonly sourceID: string
      }
    }[StrictExclude<IPlaySources, "tracks">]
  | {
      readonly source: StrictExtract<IPlaySources, "tracks">
      readonly sortBy: ISortOptions["tracks"]
    }

/**
 * When creating a new playback the sortBy field can be optional and will fall back to the default.
 */
export type INewPlayback = SetOptional<IPlayback, "sortBy">

/**
 * The playback to be send to the backend to receive the new queue.
 * It includes the shuffle property so that the backend can shuffle the queried tracks if set.
 */
export type IPlayblackToSend = IPlayback & { readonly isShuffleOn: boolean }

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

/**
 * Custom prisma findUnique argument. Used instead of the default one
 */
export type IArtistGetArgument =
  MakeCustomPrismaUniqueFind<Prisma.ArtistFindUniqueArgs>

/**
 * Custom prisma findUnique argument. Used instead of the default one
 */
export type IAlbumGetArgument =
  MakeCustomPrismaUniqueFind<Prisma.AlbumFindUniqueArgs>

type MakeCustomPrismaUniqueFind<T extends { where: unknown }> =
  | Pick<T, "where"> & {
      sortBy: ISortOptions["tracks"]
      isShuffleOn: boolean
    }

/**
 * Custom prisma findMany argument. Used instead of the default one
 */
export type IArtistFindManyArgument = MakeCustomPrismaFindMany<
  Prisma.ArtistFindManyArgs,
  ISortOptions["artists"]
>

/**
 * Custom prisma findMany argument. Used instead of the default one
 */
export type IAlbumFindManyArgument = MakeCustomPrismaFindMany<
  Prisma.AlbumFindManyArgs,
  ISortOptions["albums"]
>

/**
 * Custom prisma findMany argument. Used instead of the default one
 */
export type ITrackFindManyArgument = MakeCustomPrismaFindMany<
  Prisma.AlbumFindManyArgs,
  ISortOptions["tracks"]
>

type MakeCustomPrismaFindMany<
  T extends {
    where?: unknown
    orderBy?: Record<string, unknown> | Record<string, unknown>[]
  },
  Sort extends ISortOptions[keyof ISortOptions]
> = Partial<
  Pick<T, "where"> & {
    sortBy: Sort
    isShuffleOn: boolean
  }
>
