/* eslint-disable @typescript-eslint/no-explicit-any */
import type { app } from "electron"
import type * as mm from "music-metadata"
import type { CamelCase, ReadonlyDeep, SetOptional } from "type-fest"
import type { Either } from "fp-ts/lib/Either"
import type { Track, Album, Artist, Cover, Prisma } from "@prisma/client"
import type { DeepReadonlyNullToUndefined, OnlyKeysOf } from "./Utilities"
import type { FilePath } from "./Filesystem"
import type { StrictExtract } from "ts-essentials"

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
      include: { albums: true }
    }>,
    {
      readonly albums: readonly IAlbum[]
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

export type IElectronPaths = Parameters<typeof app.getPath>[0]

interface PreIRawAudioMetadata_ extends mm.IAudioMetadata {
  readonly filepath: FilePath
}

export type IRawAudioMetadata = ReadonlyDeep<PreIRawAudioMetadata_>

export interface IRawAudioMetadataWithPicture extends IRawAudioMetadata {
  readonly common: IRawAudioMetadata["common"] & { picture: mm.IPicture[] }
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

export type ITracksSource = `${CamelCase<
  StrictExtract<Prisma.ModelName, "Artist" | "Album" | "Track">
>}s`

export type ISortOrder = "ascending" | "descending"

type makeSortOptions<T extends Record<ITracksSource, string>> = {
  readonly [key in ITracksSource]: readonly [T[key], ISortOrder]
}

export type ITrackSortTypes = StrictExtract<
  keyof ITrack,
  "album" | "artist" | "duration" | "title" | "trackNo"
>

export type ISortOptions = makeSortOptions<{
  albums: "name"
  tracks: ITrackSortTypes
  artists: "name"
}>

export type IPlaySource = {
  [Key in ITracksSource]: ReadonlyDeep<{
    type: Key
    // Only tracks need to be sorted for the queue
    sort: ISortOptions["tracks"]
    // Only tracks have a numeric id, and we don't need their ID when playing back a source, as they would be played from "My tracks" anyway and otherwise it is always an album, artist etc. with an ID
    id?: Key extends StrictExtract<ITracksSource, "tracks"> ? never : string
  }>
}[ITracksSource]

// const x: IPlaySourceCommand = {
//   type: "albums",
//   index: 0,
//   id: "lol",
//   sort: ["trackNo", "ascending"]
// }

// const {sort} = x

// type AllXOR<T extends any[]> = T extends [infer Only]
//   ? Only
//   : T extends [infer A, infer B, ...infer Rest]
//   ? AllXOR<[XOR<A, B>, ...Rest]>
//   : never

// interface x {
//   a: string
//   b: string
//   c: string
// }

// type limitToX<T extends Exact<x, T>> = T

// type x2 = limitToX<{
//   a: string
//   b: string
//   c: string

// }>

// type x = Prisma.ArtistGetPayload<{
//   include: { tracks: true; albums: true }
// }>
