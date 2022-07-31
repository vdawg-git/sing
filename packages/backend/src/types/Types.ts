import type { ITwoWayResponse, IBackendEmitToFrontend } from "@sing-types/Types"

import type { EventEmitter } from "node:events"

export interface ICoverData {
  readonly coverMD5: string
  readonly coverPath: string
  readonly coverBuffer: Buffer
}

export interface IHandlerEmitter extends EventEmitter {
  on: (
    eventName: "sendToMain",
    listener: (data: ITwoWayResponse | IBackendEmitToFrontend) => void
  ) => this
  emit: (
    eventName: "sendToMain",
    data: ITwoWayResponse | IBackendEmitToFrontend
  ) => boolean
}
