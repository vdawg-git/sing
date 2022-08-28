/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Either } from "fp-ts/lib/Either"
import type { IpcRendererEvent } from "electron"
import type {
  DropFirst,
  ParametersFlattened,
  ParametersWithoutFirst,
} from "./Utilities"
import type { syncMusic } from "../packages/backend/src/lib/Sync"
import type { queryHandlers } from "../packages/backend/src/lib/QueryHandlers"
import type { IError, ITrack, IAlbum, IArtist, INotification } from "./Types"

export type ISyncResult = Either<
  IError,
  {
    readonly tracks: ITrack[]
    readonly artists: IArtist[]
    readonly albums: IAlbum[]
  }
>

/**
 * Also has the renderer event as its argument
 */
export interface IFrontendEventsConsume {
  readonly syncedMusic: (event: IpcRendererEvent, newMusic: ISyncResult) => void

  readonly createNotification: (
    event: IpcRendererEvent,
    notification: INotification
  ) => void
}

export type IFrontendEventsSend = {
  [Key in keyof IFrontendEventsConsume]: (
    ...arguments_: DropFirst<Parameters<IFrontendEventsConsume[Key]>>
  ) => void
}

export interface IEventHandlersConsume {
  readonly syncMusic: typeof syncMusic
}

export type IQueryHandlers = typeof queryHandlers
export type IQueryChannels = keyof IQueryHandlers

export type IBackendQueryResponse = {
  readonly queryID: string
  readonly data: ReturnType<IQueryHandlers[IQueryChannels]>
  readonly forwardToRenderer: false
}

export type IBackendQuery<T extends IQueryChannels = IQueryChannels> = {
  readonly queryID: string
  readonly event: T
  readonly arguments_: ParametersFlattened<IQueryHandlers[T]>
}

export type IBackendEmitChannels = keyof IEventHandlersConsume

export type IBackendEmitHandlers = {
  readonly [key in IBackendEmitChannels]: {
    readonly emitTo: IBackToFrontChannels[key]
    readonly arguments_: ParametersWithoutFirst<IEventHandlersConsume[key]>
  }
}

export type IBackToFrontChannels = ValidateBackToFrontEvents<{
  readonly syncMusic: "syncedMusic"
}>

export type IBackendEmitToFrontend<
  T extends keyof IFrontendEventsSend = keyof IFrontendEventsSend
> = {
  readonly event: T
  readonly data: ParametersFlattened<IFrontendEventsSend[T]>
  readonly forwardToRenderer: true
}

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
