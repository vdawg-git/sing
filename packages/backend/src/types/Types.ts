import type { FilePath } from "@sing-types/Filesystem"
import type {
  ITwoWayResponse,
  IBackendEmitToFrontend,
  ITrack,
  IArtist,
  IAlbum,
} from "@sing-types/Types"

import type { EventEmitter } from "node:events"

export interface ICoverData {
  readonly md5: string
  readonly path: FilePath
  readonly buffer: Buffer
  readonly dominantColors: {
    readonly vibrant?: [number, number, number]
    readonly darkVibrant?: [number, number, number]
    readonly lightVibrant?: [number, number, number]
    readonly muted?: [number, number, number]
    readonly darkMuted?: [number, number, number]
  }
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

export interface ISyncResult {
  readonly tracks: ITrack[]
  readonly artists: IArtist[]
  readonly albums: IAlbum[]
}
