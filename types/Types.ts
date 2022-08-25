/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FilePath } from "./Filesystem"
import type { Track, Album, Artist, Cover, Prisma } from "@prisma/client"
import type { Either } from "fp-ts/lib/Either"
import type * as mm from "music-metadata"
import type { app } from "electron"
import type { DeepReadonly, MarkOptional } from "ts-essentials"
import type { DeepReadonlyNullToUndefined } from "./Utilities"

export type ITrack = DeepReadonlyNullToUndefined<Track> & {
  filepath: FilePath
  coverPath?: FilePath
}
export type IAlbum = DeepReadonlyNullToUndefined<Album> & {
  coverPath?: FilePath
}

export type IAlbumWithTracks = DeepReadonlyNullToUndefined<
  Prisma.AlbumGetPayload<{ include: { tracks: true } }>
> & {
  coverPath?: FilePath
}

export type IArtist = DeepReadonlyNullToUndefined<Artist>

export type IArtistWithTracks = IArtist & { tracks: ITrack[] }

export type ICover = DeepReadonlyNullToUndefined<Cover>

export type ISyncResult = Either<
  IError,
  {
    readonly tracks: ITrack[]
    readonly artists: IArtist[]
    readonly albums: IAlbum[]
  }
>

export type IElectronPaths = Parameters<typeof app.getPath>[0]

interface PreIRawAudioMetadata extends mm.IAudioMetadata {
  readonly filepath: FilePath
}

export type IRawAudioMetadata = DeepReadonly<PreIRawAudioMetadata>

export interface IRawAudioMetadataWithPicture extends IRawAudioMetadata {
  common: IRawAudioMetadata["common"] & { picture: mm.IPicture[] }
}

export interface INotificationBase {
  readonly id: symbol
  readonly label: string
  readonly type?: INotificationTypes
  readonly duration?: number
}

export type INotification = MarkOptional<INotificationBase, "id">

export type INotificationTypes =
  | "loading"
  | "check"
  | "warning"
  | "danger"
  | "default"

export type IErrorTypes =
  | "Invalid arguments"
  | "Array is empty"
  | "Directory read failed"
  | "Path not accessible"
  | "File write failed"
  | "File deletion failed"
  | "File metadata parsing failed"
  | "Failed to add track to database"
  | "Failed to get from database"
  | "Failed to remove from database"

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
