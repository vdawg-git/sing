import type { Prisma } from "@prisma/client"
import type { FilePath } from "@sing-types/Filesystem"
import type {
  IBackendQueryResponse,
  IBackendEmitToFrontend,
} from "@sing-types/IPC"
import type { IAlbum, IArtist, ICover, ITrack } from "@sing-types/Types"

import type { EventEmitter } from "node:events"

export interface ICoverData {
  readonly md5: string
  readonly path: FilePath
  readonly buffer: Buffer
}

export interface IHandlerEmitter extends EventEmitter {
  on: (
    eventName: ISendToMainKey,
    listener: (data: IBackendQueryResponse | IBackendEmitToFrontend) => void
  ) => this
  emit: (
    eventName: ISendToMainKey,
    data: IBackendQueryResponse | IBackendEmitToFrontend
  ) => boolean
}

export type ISendToMainKey = "sendToMain"

type ITableNames = Uppercase<Prisma.ModelName>
type _ValidateDatabaseQueryCheckerInput<
  T extends Record<ITableNames, IArtist | IAlbum | ITrack | ICover>
> = T
type _DatabaseCheckerInput = _ValidateDatabaseQueryCheckerInput<{
  ALBUM: IAlbum
  ARTIST: IArtist
  TRACK: ITrack
  COVER: ICover
}>
export type ISQLDatabaseItemString =
  | {
      [Key in keyof _DatabaseCheckerInput]:
        | `${Key}.${Exclude<keyof _DatabaseCheckerInput[Key], symbol>}`
        | Exclude<keyof _DatabaseCheckerInput[Key], symbol>
    }[keyof _DatabaseCheckerInput]
  | ITableNames
