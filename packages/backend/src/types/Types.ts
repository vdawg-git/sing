import type { FilePath } from "@sing-types/Filesystem"
import type {
  ITwoWayResponse,
  IBackendEmitToFrontend,

} from "@sing-types/Types"

import type { EventEmitter } from "node:events"

export interface ICoverData {
  readonly md5: string
  readonly path: FilePath
  readonly buffer: Buffer
}

export interface IHandlerEmitter extends EventEmitter {
  on: (
    eventName: ISendToMainKey,
    listener: (data: ITwoWayResponse | IBackendEmitToFrontend) => void
  ) => this
  emit: (
    eventName: ISendToMainKey,
    data: ITwoWayResponse | IBackendEmitToFrontend
  ) => boolean
}

export type ISendToMainKey = "sendToMain"


