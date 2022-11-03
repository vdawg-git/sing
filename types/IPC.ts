/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IError, ITrack, IAlbum, IArtist, INotification } from "./Types"
import type {
  DropFirst,
  ParametersFlattened,
  ParametersWithoutFirst,
} from "./Utilities"
import type { queryHandlers } from "../packages/backend/src/lib/QueryHandlers"
import type { backendEventHandlers } from "../packages/backend/src/lib/EventHandlers"
import type { IpcRendererEvent } from "electron"
import type { Either } from "fp-ts/lib/Either"
import type { Simplify } from "type-fest"

export type ISyncResult = Either<
  IError,
  {
    readonly tracks: readonly ITrack[]
    readonly artists: readonly IArtist[]
    readonly albums: readonly IAlbum[]
  }
>

/**
 * Those are the event the renderer can react to from the main and backend process.
 * Also, as it is using IPC, the first argument is always the `IpcRendererEvent`.
 *
 * To make typing and usage easier, each function should only accept one argument, with the event argument left aside.
 */
export interface IFrontendEventsConsume {
  readonly syncedMusic: (event: IpcRendererEvent, newMusic: ISyncResult) => void

  readonly createNotification: (
    event: IpcRendererEvent,
    notification: INotification
  ) => void

  /**
   * If a playlist got deleted, created or renamed. Not if the tracks of a playlist changed.
   * Responsible for updating the playlists store, which does not hold information about all the playlists contents.
   */
  readonly playlistsUpdated: (event: IpcRendererEvent) => void

  /**
   * If the tracks of a playlist changed. Not if it was deleted or renamed.
   * This is so that a opened playlist can rerender with refreshed data.
   */
  readonly playlistUpdated: (
    event: IpcRendererEvent,
    changedPlaylistID: number
  ) => void
}

export type IFrontendEventsSend = Simplify<{
  [Key in keyof IFrontendEventsConsume]: (
    ...arguments_: DropFirst<Parameters<IFrontendEventsConsume[Key]>>
  ) => void
}>

/**
 * The available event handlers from the backend.
 */
export type IBackendEventHandlers = typeof backendEventHandlers

export type IQueryHandlers = typeof queryHandlers
export type IQueryChannels = keyof IQueryHandlers

export type IBackendQueryResponse = {
  readonly queryID: string
  readonly data: ReturnType<IQueryHandlers[IQueryChannels]>
  readonly forwardToRenderer: false
}

/**
 * The structure of a query to the backend, for example to get a list of tracks fromn the database.
 *
 * The `queryID` is used to identify the response from the backend.
 *
 * It gets added internally by the function `queryBackend` and is nessecary to identify the corresponding response from the backend, as the communication is asynchronous.
 *
 * ! Important: All function should only take the "emitter" and *one* argument, as I dont know how to type it otherwise.
 */
export type IBackendQuery<T extends IQueryChannels = IQueryChannels> = {
  readonly query: T
  readonly arguments_: Parameters<IQueryHandlers[T]>[1]
  readonly queryID: string
}

export type IBackendEmitChannels = keyof IBackendEventHandlers

export type IBackendEmitHandlers = {
  readonly [key in IBackendEmitChannels]: {
    readonly emitTo: IBackToFrontChannels[key]
    readonly arguments_: ParametersWithoutFirst<IBackendEventHandlers[key]>
  }
}

export type IBackToFrontChannels = ValidateBackToFrontEvents<{
  readonly syncMusic: "syncedMusic"
  readonly addTracksToPlaylist: "playlistUpdated"
}>

export type IBackendEmitToFrontend = {
  [Key in keyof IFrontendEventsSend]: {
    readonly event: Key
    readonly data: ParametersFlattened<IFrontendEventsSend[Key]> extends never
      ? undefined
      : ParametersFlattened<IFrontendEventsSend[Key]>
    readonly forwardToRenderer: true
  }
}[keyof IFrontendEventsSend]

export type IBackendEvent<
  T extends IBackendEmitChannels = IBackendEmitChannels
> = {
  readonly event: T
  readonly arguments_: IBackendEmitHandlers[T]["arguments_"]
}

export type IBackendRequest = IBackendQuery | IBackendEvent

// Helper validation
type ValidateBackToFrontEvents<
  T extends Readonly<
    Record<IBackendEmitChannels, keyof IFrontendEventsSend | undefined>
  >
> = T
