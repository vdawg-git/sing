/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Track } from "@prisma/client"

import type { Either } from "fp-ts/lib/Either"
import type * as mm from "music-metadata"
import type { app, IpcRendererEvent } from "electron"

import type { DropFirst, NullValuesToOptional } from "./Utilities"

import type {
  ParametersFlattened,
  ParametersWithoutFirst,
  InnerArray,
} from "@sing-types/Utilities"

import type { twoWayHandler } from "../packages/backend/src/lib/TwoWayHandler"

import type { syncMusic } from "../packages/backend/src/lib/Sync"

export type ITrack = NullValuesToOptional<Track>

export type IElectronPaths = Parameters<typeof app.getPath>[0]

/**
 * Also has the renderer event as its argument
 */
export interface IFrontendEventsConsume {
  readonly setMusic: (
    event: IpcRendererEvent,
    newMusic: Either<IError, readonly ITrack[]>
  ) => void
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

export interface IRawAudioMetadata extends mm.IAudioMetadata {
  readonly filepath: string
}

export interface IRawAudioMetadataWithPicture extends IRawAudioMetadata {
  common: IRawAudioMetadata["common"] & { picture: mm.IPicture[] }
}

export interface IidBackendAnswer {
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

// type IMakeOneWayHandlerSendFromRenderer<
//   Event extends keyof IFrontendEventsSend,
//   T extends (...arguments_: never[]) => unknown
// > = (...arguments_: Parameters<T>) => Promise<{
//   readonly event: Event
//   readonly emitToRenderer: true
//   readonly arguments_: Parameters<T>
//   readonly response: Awaited<ReturnType<T>>
// }>

export type ITwoWayHandlers = {
  readonly [key in ITwoWayEvents]: {
    readonly response: Awaited<ReturnType<typeof twoWayHandler[key]>>
    readonly args: InnerArray<Awaited<Parameters<typeof twoWayHandler[key]>>>
  }
}

export type ITwoWayResponse = {
  readonly id: string
  readonly data: ITwoWayHandlers[ITwoWayEvents]["response"]
}

export type ITwoWayEvents = keyof typeof twoWayHandler

export type ITwoWayRequest = {
  readonly id: string
  readonly event: ITwoWayEvents
  readonly arguments_: ITwoWayHandlers[ITwoWayEvents]["args"]
}

export type IBackendEmitChannels = keyof IOneWayHandlersConsume

export type IBackendEmitHandlers = {
  readonly [key in IBackendEmitChannels]: {
    readonly emitTo: IBackToFrontChannels[key]
    readonly arguments_: ParametersWithoutFirst<IOneWayHandlersConsume[key]>
  }
}

export type IBackToFrontChannels = ValidateBackToFrontEvents<{
  readonly syncMusic: "setMusic"
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
