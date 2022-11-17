import type {
  IFrontendEventsConsume,
  IFrontendEventsSend,
} from "../../../../types/IPC"
import type { ParametersWithoutFirst } from "../../../../types/Utilities"
import type { mainEventHandlers } from "../MainEventHandlers"
import type { mainQueryHandlers } from "../MainQueryHandlers"
import type {
  IpcMain,
  IpcMainEvent,
  IpcMainInvokeEvent,
  IpcRenderer,
  WebContents,
} from "electron"

export type IMainQueryHandlers = {
  [Handler in keyof typeof mainQueryHandlers]: (
    ...arguments_: ParametersWithoutFirst<typeof mainQueryHandlers[Handler]>
  ) => ReturnType<typeof mainQueryHandlers[Handler]>
}

export type IMainEventHandlers = {
  [Handler in keyof typeof mainEventHandlers]: (
    ...arguments_: ParametersWithoutFirst<typeof mainEventHandlers[Handler]>
  ) => ReturnType<typeof mainEventHandlers[Handler]>
}

export type IMainQueryKeys = keyof typeof mainQueryHandlers

export interface TypedIpcMain extends IpcMain {
  on<K extends keyof IMainEventHandlers>(
    channel: K,
    listener: (
      event: IpcMainEvent,
      ...arguments_: Parameters<IMainEventHandlers[K]>
    ) => void
  ): this
  once<K extends keyof IMainEventHandlers>(
    channel: K,
    listener: (
      event: IpcMainEvent,
      ...arguments_: Parameters<IMainEventHandlers[K]>
    ) => void
  ): this
  removeListener<K extends keyof IMainEventHandlers>(
    channel: K,
    listener: (
      event: IpcMainEvent,
      ...arguments_: Parameters<IMainEventHandlers[K]>
    ) => void
  ): this
  removeAllListeners<K extends keyof IMainEventHandlers>(channel?: K): this
  handle<K extends IMainQueryKeys>(
    channel: K,
    listener: (
      event: IpcMainInvokeEvent,
      ...arguments_: Parameters<IMainQueryHandlers[K]>
    ) => ReturnType<IMainQueryHandlers[K]>
  ): void
  handleOnce<K extends IMainQueryKeys>(
    channel: K,
    listener: (
      event: IpcMainInvokeEvent,
      ...arguments_: Parameters<IMainQueryHandlers[K]>
    ) => ReturnType<IMainQueryHandlers[K]>
  ): void
  removeHandler<K extends IMainQueryKeys>(channel: K): void
}

export interface TypedIpcRenderer extends IpcRenderer {
  on<Key extends keyof IFrontendEventsConsume>(
    channel: Key,
    listener: IFrontendEventsConsume[Key]
  ): this
  once<Key extends keyof IFrontendEventsConsume>(
    channel: Key,
    listener: IFrontendEventsConsume[Key]
  ): this
  removeListener<Key extends keyof IFrontendEventsConsume>(
    channel: Key,
    listener: IFrontendEventsConsume[Key]
  ): this
  removeAllListeners<K extends keyof IFrontendEventsConsume>(channel: K): this
  send<Key extends keyof IMainEventHandlers>(
    channel: Key,
    ...arguments_: Parameters<IMainEventHandlers[Key]>
  ): void
  sendSync<Key extends keyof IMainEventHandlers>(
    channel: Key,
    ...arguments_: Parameters<IMainEventHandlers[Key]>
  ): Parameters<IMainEventHandlers[Key]>
  sendTo<Key extends keyof IFrontendEventsSend>(
    webContentsId: number,
    channel: Key,
    ...arguments_: [IFrontendEventsSend[Key]]
  ): void
  sendToHost<Key extends keyof IMainEventHandlers>(
    channel: Key,
    ...arguments_: Parameters<IMainEventHandlers[Key]>
  ): void
  invoke<Key extends IMainQueryKeys>(
    channel: Key,
    ...arguments_: Parameters<IMainQueryHandlers[Key]>
  ): ReturnType<IMainQueryHandlers[Key]>
}

export interface TypedWebContents extends WebContents {
  send<Key extends keyof IFrontendEventsSend>(
    channel: Key,
    ...arguments_: [IFrontendEventsSend[Key]]
  ): void

  getAllWebContents(): TypedWebContents[]
}
