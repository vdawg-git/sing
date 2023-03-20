/* eslint-disable @typescript-eslint/no-explicit-any */

import type { ITestAttribute } from "../packages/renderer/src/TestConsts"
import type { FilePath } from "./Filesystem"
import type {
  ITrack,
  IAlbum,
  IArtist,
  IPlaylistCreateArgument,
} from "./DatabaseTypes"
import type { Prisma } from "../packages/generated/client"
import type { app } from "electron"
import type { Either } from "fp-ts/lib/Either"
import type * as mm from "music-metadata"
import type { StrictExclude, StrictExtract } from "ts-essentials"
import type {
  CamelCase,
  ReadonlyDeep,
  SetOptional,
  SetRequired,
} from "type-fest"
import type { SvelteComponentDev } from "svelte/internal"
import type { IQueueItem } from "@/types/Types"

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
  /**
   * The duration in seconds. Set to -1 to remove the duration.
   */
  readonly duration?: number
  /**
   * Whether the user can click away the notification
   */
  readonly isRemoveable?: boolean
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
  | "Failed to read out image"
  | "Failed to remove cover from playlist"
  | "Failed to remove unused albums from the database"
  | "Failed to remove unused artists from the database"
  | "Failed to remove unused covers from the database"
  | "Failed to remove unused tracks from the database"
  | "Failed to rename playlist at database"
  | "Failed to set playlist image"
  | "Failed to update playlist"
  | "File deletion failed"
  | "File metadata parsing failed"
  | "File write failed"
  | "Image name is missing an extension"
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
export type IPlaySourceOrigin =
  | CamelCase<StrictExtract<Prisma.ModelName, "Artist" | "Album" | "Playlist">>
  | `all${StrictExtract<Prisma.ModelName, "Track">}s`

export type ISortOrder = "ascending" | "descending"

// TODO makes albums sortable by release date. Low priority though

export type IPlaySource = validatePlayback<
  | {
      readonly origin: StrictExtract<IPlaySourceOrigin, "album">
      // The ID of the source to be played. For example, an album id.
      readonly sourceID: StrictExclude<
        Prisma.AlbumWhereUniqueInput["id"],
        undefined
      >
    }
  | {
      readonly origin: StrictExtract<IPlaySourceOrigin, "allTracks">
      // Does not need an ID, as it is just all tracks
    }
  | {
      readonly origin: StrictExtract<IPlaySourceOrigin, "playlist">
      readonly sourceID: StrictExclude<
        Prisma.PlaylistWhereUniqueInput["id"],
        undefined
      >
    }
  | {
      readonly origin: StrictExtract<IPlaySourceOrigin, "artist">
      readonly sourceID: StrictExclude<
        Prisma.ArtistWhereUniqueInput["name"],
        undefined
      >
    }
>

export type IFetchPlaybackArgument = SetRequired<
  Pick<ISetPlaybackArgument, "isShuffleOn" | "source">,
  "isShuffleOn"
>

export type ISetPlaybackArgument = Readonly<{
  firstTrack?: ITrack
  index: number
  isShuffleOn?: boolean
  source: IPlaySource
}>

export type ISetPlaybackArgumentWithItems = Readonly<{
  items: readonly IQueueItem[]
}> &
  ISetPlaybackArgument

type validatePlayback<T extends { origin: IPlaySourceOrigin }> = T

export type ICurrentPlayback = IPlaySource & { index: number }

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
  readonly testAttribute: ITestAttribute | readonly ITestAttribute[]
}

export type ISearchResultItem = {
  readonly image?: FilePath
  /** Only needed for artist currently */
  readonly isImageCircle?: boolean
  readonly title: string
  /** Only needed for topMatches "album" and "track" */
  readonly label?: string
  readonly subtexts: readonly ISearchItemSubtext[]
  readonly onClick: () => void
  readonly icon: typeof SvelteComponentDev
  readonly itemForContextMenu: IPlaylistCreateArgument
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
export type RANDOM = "RANDOM"

export type ITracksSortKeys =
  | StrictExtract<keyof ITrack, "title" | "trackNo" | "album">
  | RANDOM

export type TrackAndIndex = { track: ITrack; index: number }
