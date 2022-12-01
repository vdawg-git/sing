import type { FilePath } from "@sing-types/Filesystem"
import type {
  IAlbum,
  IArtist,
  ICover,
  IPlaylist,
  IPlaylistItem,
  IPlaylistUpdateCoverArgumentConsume,
  ITrack,
} from "@sing-types/DatabaseTypes"
import type { IFrontendEventsSend } from "@sing-types/IPC"
import type { IPlaylistID } from "@sing-types/Opaque"
import type { Override } from "@sing-types/Utilities"
import type { Prisma } from "@prisma/client"

export interface ICoverData {
  readonly md5: string
  readonly path: FilePath
  readonly buffer: Buffer
}

export type ISendToMainKey = "sendToMain"

/**
 * The possible database keys for a SQL query.
 */
export type ISQLDatabaseItemString =
  | {
      [Key in keyof _DatabaseCheckerInput]:
        | `${Key}.${Exclude<keyof _DatabaseCheckerInput[Key], symbol> | "*"}`
        | Exclude<keyof _DatabaseCheckerInput[Key], symbol | number>
    }[keyof _DatabaseCheckerInput]
  | Prisma.ModelName

/**
 * If this errors check {@link _ValidateDatabaseQueryCheckerInput}
 */
type _DatabaseCheckerInput = _ValidateDatabaseQueryCheckerInput<{
  Album: IAlbum
  Artist: IArtist
  Track: ITrack
  Cover: ICover
  Playlist: IPlaylist
  PlaylistItem: IPlaylistItem
}>

/**
 * Check that the types keys are correct.
 */
type _ValidateDatabaseQueryCheckerInput<
  T extends Record<
    Prisma.ModelName,
    IArtist | IAlbum | ITrack | ICover | IPlaylist | IPlaylistItem
  >
> = T

/**
 * This is the structure of the data to get searched. The primary and secondary etc. determine the search weigth accordingly. The rest is included to get forwarded to the renderer
 */
export type IToSearchData = IToSearchArtist | IToSearchAlbum | IToSearchTrack

type IToSearchArtist = {
  readonly type: "artist"
  readonly artist: IArtist
  readonly primary: string
}
type IToSearchAlbum = {
  readonly type: "album"
  readonly album: IAlbum
  readonly primary: string
  readonly secondary?: string
}
type IToSearchTrack = {
  readonly type: "track"
  readonly track: ITrack
  readonly primary: string
  readonly secondary?: string
  readonly tertiary?: string
}

/**
 * Currently there are no internal backend events, but I wanted to implement some and now it is easy to support them
 */
export type IBackEndMessages = TransfromToEmitterData<
  IFrontendEventsSend,
  true
> &
  TransfromToEmitterData<IInternalEvents, false>

export type IInternalEvents = { playlistUpdatedInternal: IPlaylistID }

type TransfromToEmitterData<
  T extends Record<string, unknown>,
  ShouldForwardToRenderer extends boolean
> = {
  [Key in keyof T]: {
    readonly event: Key
    readonly data: T[Key]
    readonly shouldForwardToRenderer: ShouldForwardToRenderer
  }
}

/**
 * This is different from `IPlaylistUpdateCoverArgument` as this is only used by the backend and is not responsible for removing the cover.
 */
export type IPlaylistSetCoverArgument = Override<
  IPlaylistUpdateCoverArgumentConsume,
  { filepath: FilePath }
>
