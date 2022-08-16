/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FilePath } from "./Filesystem"
import type { Track, Album, Artist, Cover } from "@prisma/client"
import type { Either } from "fp-ts/lib/Either"
import type * as mm from "music-metadata"
import type { app, IpcRendererEvent } from "electron"
import type { DeepReadonly } from "ts-essentials"
import type {
  DropFirst,
  NullValuesToOptional,
  ParametersFlattened,
  ParametersWithoutFirst,
} from "./Utilities"
import type { syncMusic } from "../packages/backend/src/lib/Sync"
import type { twoWayHandlers } from "../packages/backend/src/lib/TwoWayHandler"

export type ITrack = DeepReadonly<NullValuesToOptional<Track>> & {
  filepath: FilePath
}
export type IAlbum = DeepReadonly<NullValuesToOptional<Album>>
export type IArtist = DeepReadonly<NullValuesToOptional<Artist>>
export type ICover = DeepReadonly<NullValuesToOptional<Cover>>

export type ISyncResult = Either<
  IError,
  {
    readonly tracks: ITrack[]
    readonly artists: IArtist[]
    readonly albums: IAlbum[]
  }
>

export type IElectronPaths = Parameters<typeof app.getPath>[0]

/**
 * Also has the renderer event as its argument
 */
export interface IFrontendEventsConsume {
  readonly syncedMusic: (event: IpcRendererEvent, newMusic: ISyncResult) => void

  readonly createNotification: (
    event: IpcRendererEvent,
    notification: INotificationFromBackend
  ) => void
}
export type IFrontendEventsSend = {
  [Key in keyof IFrontendEventsConsume]: (
    ...arguments_: DropFirst<Parameters<IFrontendEventsConsume[Key]>>
  ) => void
}

interface PreIRawAudioMetadata extends mm.IAudioMetadata {
  readonly filepath: FilePath
}

export type IRawAudioMetadata = DeepReadonly<PreIRawAudioMetadata>

export interface IRawAudioMetadataWithPicture extends IRawAudioMetadata {
  common: IRawAudioMetadata["common"] & { picture: mm.IPicture[] }
}

export interface IIDBackendAnswer {
  readonly id: string
  readonly data: Either<IError, unknown>
}

export interface INotification {
  readonly id: symbol
  readonly label: string
  readonly type?: INotificationTypes
  readonly duration?: number
}
export type INotificationFromBackend = Omit<INotification, "id">

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

export interface IOneWayHandlersConsume {
  readonly syncMusic: typeof syncMusic
}

export type ITwoWayHandlers = typeof twoWayHandlers
export type ITwoWayChannel = keyof ITwoWayHandlers

export type ITwoWayResponse = {
  readonly id: string
  readonly data: ReturnType<ITwoWayHandlers[ITwoWayChannel]>
  readonly emitToRenderer: false
}

export type ITwoWayRequest = {
  readonly id: string
  readonly event: ITwoWayChannel
  readonly arguments_: Parameters<ITwoWayHandlers[ITwoWayChannel]>
}

export type IBackendEmitChannels = keyof IOneWayHandlersConsume

export type IBackendEmitHandlers = {
  readonly [key in IBackendEmitChannels]: {
    readonly emitTo: IBackToFrontChannels[key]
    readonly arguments_: ParametersWithoutFirst<IOneWayHandlersConsume[key]>
  }
}

export type IBackToFrontChannels = ValidateBackToFrontEvents<{
  readonly syncMusic: "syncedMusic"
}>

export interface IBackendEmitToFrontend {
  readonly event: keyof IFrontendEventsSend
  readonly data: ParametersFlattened<
    IFrontendEventsSend[keyof IFrontendEventsSend]
  >
  readonly emitToRenderer: true
}

export type IDataSendToBackend = {
  readonly event: IBackendEmitChannels
  readonly arguments_: IBackendEmitHandlers[IBackendEmitChannels]["arguments_"]
}

export type IBackendRequest = ITwoWayRequest | IDataSendToBackend

type ValidateBackToFrontEvents<
  T extends Readonly<
    Record<IBackendEmitChannels, keyof IFrontendEventsSend | undefined>
  >
> = T
