/* eslint-disable @typescript-eslint/no-explicit-any */

import type { ISortOptions } from "./Types"
import type { IPlaylistID, ITrackID } from "./Opaque"
import type { DirectoryPath, FilePath } from "./Filesystem"
import type {
  DeepReadonlyNullToUndefined,
  OnlyKeysOf,
  Override,
  SingleOrNonEmptyArray,
} from "./Utilities"
import type {
  Prisma,
  Track,
  Album,
  Artist,
  Cover,
  Playlist,
} from "../packages/generated/client"
import type { Opaque } from "type-fest"
import type { CamelCase, StrictExtract, StrictOmit } from "ts-essentials"

export type IPlaylist = DeepReadonlyNullToUndefined<Playlist> &
  OnlyKeysOf<
    Prisma.PlaylistGetPayload<{
      include: { thumbnailCovers: true }
    }>,
    {
      readonly thumbnailCovers?: readonly ICover[]
      readonly id: IPlaylistID
    }
  >

/**
 * Also includes the playlists content in contrast to `IPlaylist`.
 * The content are `IPlaylistItem` and not `ITrack`.
 *
 * For the type with `ITrack` see `IPlaylistWithTracks`
 *
 */
export type IPlaylistWithItems = DeepReadonlyNullToUndefined<Playlist> &
  OnlyKeysOf<
    Prisma.PlaylistGetPayload<{
      include: { thumbnailCovers: true; items: { include: { track: true } } }
    }>,
    {
      readonly thumbnailCovers?: readonly ICover[]
      readonly items: readonly IPlaylistItem[]
      readonly id: IPlaylistID
    }
  >

/**
 * Also includes the playlists tracks in contrast to `IPlaylist`.
 */
export type IPlaylistWithTracks = IPlaylist & {
  readonly tracks: readonly IPlaylistTrack[]
}

/**
 * Like `ITrack`, but also includes the index of where the track is located (index one would be the first track of the playlist)
 */
export type IPlaylistTrack = ITrack & { readonly manualOrderIndex: number }

export type IPlaylistItem = Override<
  DeepReadonlyNullToUndefined<
    Prisma.PlaylistItemGetPayload<{ include: { track: true } }>
  >,
  {
    id: Opaque<number, "IPlaylistItemID">
  }
>

export type ITrack = Override<
  DeepReadonlyNullToUndefined<Track>,
  {
    readonly filepath: FilePath
    readonly cover?: FilePath
    readonly id: ITrackID
  }
>

export type IAlbum = DeepReadonlyNullToUndefined<Album> &
  OnlyKeysOf<
    Prisma.AlbumGetPayload<{
      include: { tracks: true }
    }>,
    {
      cover?: FilePath

      tracks: readonly ITrack[]
    }
  >

export type IArtist = DeepReadonlyNullToUndefined<Artist> &
  OnlyKeysOf<
    Prisma.ArtistGetPayload<{
      include: { albums: true; tracks: true }
    }>,
    {
      readonly tracks: readonly ITrack[]
      readonly albums: readonly IAlbum[]
      readonly image?: FilePath
    }
  >

export type IArtistWithAlbumsAndTracks = IArtist &
  OnlyKeysOf<
    Prisma.ArtistGetPayload<{
      include: { tracks: true; albums: true }
    }>,
    {
      readonly albums: readonly IAlbum[]
      readonly tracks: readonly ITrack[]
    }
  >

export type ICover = DeepReadonlyNullToUndefined<Cover> &
  OnlyKeysOf<
    Cover,
    {
      readonly filepath: FilePath
    }
  >

/**
 * Custom prisma findUnique argument. Used instead of the default one
 */
export type IArtistGetArgument =
  MakeCustomPrismaFindUnique<Prisma.ArtistFindUniqueArgs>

/**
 * Custom prisma findUnique argument. Used instead of the default one
 */
export type IAlbumGetArgument =
  MakeCustomPrismaFindUnique<Prisma.AlbumFindUniqueArgs>

/**
 * Custom prisma findMany argument. Used instead of the default one
 */
export type IPlaylistFindManyArgument = MakeCustomPrismaFindMany<
  Prisma.PlaylistFindManyArgs,
  ISortOptions["playlists"]
>

/**
 * Custom prisma findUnique argument. Used instead of the default one
 */
export type IPlaylistGetArgument = MakeCustomPrismaFindUnique<
  Prisma.PlaylistFindUniqueArgs,
  ISortOptions["playlist"]
>

/**
 * Custom prisma findMany argument. Used instead of the default one
 */
export type IArtistFindManyArgument = MakeCustomPrismaFindMany<
  Prisma.ArtistFindManyArgs,
  ISortOptions["artists"]
>

/**
 * Custom prisma findMany argument. Used instead of the default one
 */
export type IAlbumFindManyArgument = MakeCustomPrismaFindMany<
  Prisma.AlbumFindManyArgs,
  ISortOptions["albums"]
>

/**
 * Custom prisma findMany argument. Used instead of the default one
 */
export type ITrackFindManyArgument = MakeCustomPrismaFindMany<
  Prisma.TrackFindManyArgs,
  ISortOptions["tracks"]
>

/**
 * Create the default structure for a an music item API call.
 *
 * The second argument is the sorting type, which defaults to `ISortOptions["tracks"]`.
 */
type MakeCustomPrismaFindUnique<
  T extends { where: unknown },
  SortOptions extends ISortOptions[keyof ISortOptions] = ISortOptions["tracks"]
> =
  | Pick<T, "where"> & {
      readonly sortBy?: SortOptions
      readonly isShuffleOn?: boolean
    }

type MakeCustomPrismaFindMany<
  T extends {
    where?: unknown
    orderBy?: Record<string, unknown> | Record<string, unknown>[]
  },
  Sort extends ISortOptions[keyof ISortOptions]
> = Partial<
  Pick<T, "where"> & {
    sortBy: Sort
    isShuffleOn: boolean
  }
>

export type IPlaylistRenameArgument = {
  readonly id: IPlaylistID
  /**
   * The new name of the playlist.
   */
  readonly name: string
}

/**
 * If image is undefined, it should remove the manually added image.
 * This interface is used by the backend which needs to know where to save the image to. (The cover user data location.)
 * This location gets passed to the backend by the main process, which gets the image and the ID from the renderer.
 */
export type IPlaylistUpdateCoverArgumentConsume = {
  /**
   * The ID of the playlist to update.
   */
  readonly id: IPlaylistID
  /**
   * The filepath to the image to set. `Undefined` means it will be removed if it exists.
   */
  readonly filepath: FilePath | undefined
  /**
   * The path to the cover user data directory.
   */
  readonly coversDirectory: DirectoryPath
}

/**
 * Same as {@link IPlaylistUpdateCoverArgumentConsume}, but used by the renderer, which does not know where to save the image to. (The cover user data location.)
 */
export type IPlaylistUpdateCoverArgumentSend = StrictOmit<
  IPlaylistUpdateCoverArgumentConsume,
  "coversDirectory"
>

export type IPlaylistEditDescriptionArgument = {
  readonly id: IPlaylistID
  /**
   * The description to set. If `undefined`, the description will be removed.
   */
  readonly description: string | undefined
}

export type IMusicItems =
  | ITrack
  | IAlbum
  | IArtist
  | IPlaylist
  | readonly ITrack[]
  | readonly IAlbum[]
  | readonly IArtist[]
  | readonly IPlaylist[]

/**
 * Used this when you want a more specific version of IMusicIDsUnion by indexing this.
 */
export type IMusicIDs = {
  playlist: {
    readonly type: "playlist"
  } & OnlyKeysOf<
    Prisma.PlaylistWhereUniqueInput,
    {
      id: SingleOrNonEmptyArray<IPlaylistID>
    }
  >
  album: {
    readonly type: "album"
  } & _PickAndMakeArrayUnion<Prisma.AlbumWhereUniqueInput, "id">
  artist: {
    readonly type: "artist"
  } & _PickAndMakeArrayUnion<Prisma.ArtistWhereUniqueInput, "name">
  track: {
    readonly type: "track"
  } & OnlyKeysOf<
    Prisma.TrackWhereUniqueInput,
    {
      id: SingleOrNonEmptyArray<ITrackID>
    }
  >
}

export type IMusicIDsUnion = validateMusicIDTypes<IMusicIDs[keyof IMusicIDs]>

/**
 * The name property is used to set the name of the created playlist.
 */
export type IPlaylistCreateArgument = IMusicIDsUnion & Pick<IPlaylist, "name">

export type IAddTracksToPlaylistArgument = {
  readonly playlist: IPlaylist
  readonly musicToAdd: IMusicIDsUnion
  readonly insertAt?: number
}

export type IRemoveTracksFromPlaylistArgument = {
  id: IPlaylistID
  trackIDs: readonly ITrackID[]
}

type validateMusicIDTypes<
  T extends {
    type: CamelCase<
      StrictExtract<Prisma.ModelName, "Artist" | "Album" | "Playlist" | "Track">
    >
  }
> = T

/**
 * Extract the ID and make it required.
 *
 * Do not provide a union type as the second argument.
 */
type _PickAndMakeArrayUnion<
  T extends Record<string, unknown>,
  A extends keyof T
> = { readonly [Key in A]-?: SingleOrNonEmptyArray<Exclude<T[A], undefined>> }
