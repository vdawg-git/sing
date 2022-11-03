import * as E from "fp-ts/Either"
import * as RA from "fp-ts/lib/ReadonlyArray"
import { pipe } from "fp-ts/lib/function"
import { omit } from "fp-ts-std/Struct"
import log from "ololog"
import { match, P } from "ts-pattern"

import {
  extractTrackIDs,
  insertIntoArray,
  removeNulledKeys,
  sortByKey,
  sortTracks,
  updateKeyValue,
} from "@sing-shared/Pures"
import type { FilePath } from "@sing-types/Filesystem"
import { isKeyOfObject } from "@sing-types/Typeguards"
import type {
  IAlbum,
  ITrack,
  ICover,
  IArtist,
  IArtistGetArgument,
  IArtistFindManyArgument,
  IAlbumGetArgument,
  IAlbumFindManyArgument,
  ITrackFindManyArgument,
  IPlaylist,
  IPlaylistFindManyArgument,
  IPlaylistRenameArgument,
  IPlaylistWithItems,
  IMusicItems,
  IPlaylistItem,
  IPlaylistGetArgument,
  IPlaylistWithTracks,
  IPlaylistTrack,
} from "@sing-types/DatabaseTypes"
import type { IError, ISortOptions, IErrorTypes } from "@sing-types/Types"
import type { IPlaylistID, ITrackID } from "@sing-types/Opaque"

import { createDefaultPlaylistName, createPlaylistItem } from "@/Helper"
import type { IHandlerEmitter } from "@/types/Types"

import { SQL_STRINGS as SQL } from "./Consts"
import { createPrismaClient } from "./CustomPrismaClient"

import type { PrismaPromise, PlaylistItem, Prisma } from "@prisma/client"
import type { Either } from "fp-ts/Either"

const prisma = createPrismaClient()

// TODO Update changed covers correctly (now they are getting deleted for whatever reason when they change)

export async function getPlaylists(
  _: IHandlerEmitter,
  options?: IPlaylistFindManyArgument
): Promise<Either<IError, readonly IPlaylist[]>> {
  const prismaOptions: Prisma.PlaylistFindManyArgs = {
    where: options?.where,
    include: { thumbnailCovers: true },
  }

  const defaultSort: ISortOptions["playlists"] = ["name", "ascending"]

  return prisma.playlist
    .findMany(prismaOptions)
    .then(RA.map(removeNulledKeys))
    .then((playlists) => sortByKey(options?.sortBy ?? defaultSort, playlists))
    .then((playlists) => E.right(playlists as IPlaylist[]))
    .catch(createError("Failed getting playlists from database"))
}

export async function getPlaylist(
  _: IHandlerEmitter | undefined,
  { where, sortBy, isShuffleOn }: IPlaylistGetArgument
): Promise<Either<IError, IPlaylistWithTracks>> {
  const defaultSort: ISortOptions["playlist"] = [
    "manualOrderIndex",
    "ascending",
  ]

  const usedSort: ISortOptions["playlist"] | ["RANDOM"] = isShuffleOn
    ? ["RANDOM"]
    : sortBy ?? defaultSort

  return (
    prisma.playlist
      .findUniqueOrThrow({
        where: {
          id: where.id,
        },
        include: { items: { include: { track: true } } },
      })
      .then((playlist) => playlist as unknown as IPlaylistWithItems)
      // Convert the item[] to ( ITrack & {playlistIndex: number} )[]
      .then((playlist) => {
        const tracks: readonly IPlaylistTrack[] = playlist.items.map(
          (item) => ({
            ...item.track,
            manualOrderIndex: item.index,
          })
        )
        return pipe({ ...playlist, tracks }, omit(["items"]))
      })
      .then((playlist) =>
        updateKeyValue("tracks", sortTracks(usedSort), playlist)
      )
      .then(removeNulledKeys)
      .then((playlist) => E.right(playlist))
      .catch(createError("Failed getting playlist from database"))
  )
}

/**
 * Used internally and not exposed to the front-end.
 * This gets the playlist with its database items, which are not tracks, but wrapper of tracks.
 */
async function getPlaylistWithItems(
  _: IHandlerEmitter | undefined,
  id: IPlaylistID
): Promise<Either<IError, IPlaylistWithItems>> {
  return prisma.playlist
    .findUniqueOrThrow({
      where: {
        id,
      },
      include: { items: { include: { track: true } } },
    })
    .then((playlist) => playlist as unknown as IPlaylistWithItems)
    .then(removeNulledKeys)
    .then(E.right)
    .catch(createError("Failed getting playlist from database"))
}

export async function createPlaylist(
  emitter: IHandlerEmitter,
  tracks?: readonly ITrack[]
): Promise<Either<IError, IPlaylist>> {
  try {
    const usedNames = await prisma.playlist
      .findMany({ select: { name: true } })
      .then(RA.map(({ name }) => name))

    const rawPlaylist = await prisma.playlist.create({
      data: {
        name: createDefaultPlaylistName(usedNames),
        ...(!!tracks && { tracks }),
      },
    })

    log({ rawPlaylist })

    emitter.emit("sendToMain", {
      event: "playlistsUpdated",
      forwardToRenderer: true,
      data: undefined,
    })

    return pipe(rawPlaylist, removeNulledKeys, (playlist) =>
      E.right(playlist as IPlaylist)
    )
  } catch (error) {
    return createError("Failed creating playlist at database")(error)
  }
}

export async function renamePlaylist(
  emitter: IHandlerEmitter,
  { id: playlistID, newName }: IPlaylistRenameArgument
): Promise<Either<IError, string>> {
  try {
    prisma.playlist.update({
      where: { id: playlistID },
      data: { name: newName },
    })

    emitter.emit("sendToMain", {
      event: "playlistsUpdated",
      forwardToRenderer: true,
      data: undefined,
    })

    return E.right(newName)
  } catch (error) {
    return createError("Failed renaming playlist at database")(error)
  }
}

export async function deletePlaylist(
  emitter: IHandlerEmitter,
  id: number
): Promise<Either<IError, number>> {
  // TODO let the renderer know that the playlist amount has changed. Probably need to implement some async events for that to work

  try {
    prisma.playlist.delete({ where: { id } })

    emitter.emit("sendToMain", {
      event: "playlistsUpdated",
      forwardToRenderer: true,
      data: undefined,
    })

    return E.right(id)
  } catch (error) {
    return createError("Failed deleting playlist at database")(error)
  }
}

export type IAddTracksToPlaylistArgument = {
  readonly playlist: IPlaylist
  readonly musicToAdd: IMusicItems
  readonly insertAt?: number
}

/**
 * Add tracks to a playlist. Does not return an updated playlist, instead it messages the renderer that the playlist has changed.
 *
 * The renderer then refreshes the plalyist. And as this does nopt return anything, it is treated as an event and not as a query.
 */
export async function addTracksToPlaylist(
  toMainEmitter: IHandlerEmitter,
  { musicToAdd, playlist, insertAt }: IAddTracksToPlaylistArgument
): Promise<void> {
  const trackIDs = extractTrackIDs(musicToAdd)

  const resultEither = await match(insertAt)
    .with(P.nullish, () => appendTracksToPlaylist(playlist)(trackIDs))
    .with(P.number, (insertIndex) =>
      insertTracksIntoPlaylist(playlist, insertIndex)(trackIDs)
    )
    .exhaustive()

  E.foldW(
    (error) => {
      log.error.red(error)
      toMainEmitter.emit("sendToMain", {
        forwardToRenderer: true,
        event: "createNotification",
        data: { label: "Failed to update playlist", type: "danger" },
      })
    },
    (_success) => {
      toMainEmitter.emit("sendToMain", {
        forwardToRenderer: true,
        event: "createNotification",
        // TODO make this nice and meaningful
        data: {
          label: `Added ${musicToAdd} to ${playlist.name}`,
          type: "check",
        },
      })

      toMainEmitter.emit("sendToMain", {
        forwardToRenderer: true,
        event: "playlistUpdated",
        data: playlist.id,
      })
    }
  )(resultEither)
}

export async function getArtists(
  _?: IHandlerEmitter,
  options?: IArtistFindManyArgument
): Promise<Either<IError, readonly IArtist[]>> {
  const prismaOptions: Prisma.ArtistFindManyArgs = {
    where: options?.where,
    include: {
      albums: {
        include: {
          coverPath: true,
        },
      },
      tracks: true,
    },
  }

  const defaultSort: ISortOptions["artists"] = ["name", "ascending"]

  const response = prisma.artist.findMany(prismaOptions) as PrismaPromise<
    IArtist[]
  >

  return response
    .then(RA.map(removeNulledKeys))
    .then(RA.map(addArtistImage))
    .then((artists) => sortByKey(options?.sortBy ?? defaultSort, artists))
    .then(E.right)
    .catch(createError("Failed getting artists from database"))
}

/**
 * The handler emitter is injected by the backend at `index.ts`. If we need to call this function not from the, passing undefined as the emitter is fine.
 */
export async function getArtist(
  _: IHandlerEmitter | undefined,
  { where, sortBy, isShuffleOn }: IArtistGetArgument
): Promise<Either<IError, IArtist>> {
  const include: Prisma.ArtistInclude = {
    albums: {
      include: {
        coverPath: true,
      },
    },
    tracks: true,
  } as const

  const defaultSort: ISortOptions["tracks"] = ["album", "ascending"]

  const usedSort: ISortOptions["tracks"] | ["RANDOM"] = isShuffleOn
    ? ["RANDOM"]
    : sortBy ?? defaultSort

  const rawArtist = prisma.artist.findUniqueOrThrow({
    where,
    include,
  }) as unknown as PrismaPromise<IArtist>

  return rawArtist
    .then((artist) => updateKeyValue("tracks", sortTracks(usedSort), artist))
    .then(removeNulledKeys)
    .then(addArtistImage)
    .then(E.right)
    .catch(createError("Failed getting tracks from database"))
}

export async function getAlbums(
  _?: IHandlerEmitter,
  options?: IAlbumFindManyArgument
): Promise<Either<IError, readonly IAlbum[]>> {
  const prismaOptions: Prisma.AlbumFindManyArgs = {
    where: options?.where,
    include: { tracks: true },
  }

  const defaultSort: ISortOptions["albums"] = ["name", "ascending"]

  return prisma.album
    .findMany(prismaOptions)
    .then(RA.map(removeNulledKeys))
    .then((albums) => sortByKey(options?.sortBy ?? defaultSort, albums))
    .then((albums) => E.right(albums as unknown as IAlbum[]))
    .catch(createError("Failed getting albums from database"))
}

export async function getAlbum(
  _: IHandlerEmitter | undefined,
  { where, isShuffleOn, sortBy }: IAlbumGetArgument
): Promise<Either<IError, IAlbum>> {
  const include: Prisma.AlbumInclude = {
    tracks: true,
  }

  const sort: ISortOptions["tracks"] | ["RANDOM"] = isShuffleOn
    ? ["RANDOM"]
    : sortBy ?? ["trackNo", "ascending"]

  const rawResponse = prisma.album.findUniqueOrThrow({
    where,
    include,
  }) as unknown as PrismaPromise<IAlbum>

  return rawResponse
    .then((album) => updateKeyValue("tracks", sortTracks(sort), album))
    .then(removeNulledKeys)
    .then((album) => E.right(album as IAlbum))
    .catch(createError("Failed getting album from database"))
}

export async function getTracks(
  _?: IHandlerEmitter,
  options?: ITrackFindManyArgument
): Promise<Either<IError, readonly ITrack[]>> {
  const prismaOptions: Prisma.TrackFindManyArgs = { where: options?.where }

  const defaultSort: ISortOptions["tracks"] = ["title", "ascending"]

  const usedSort: ISortOptions["tracks"] | ["RANDOM"] = options?.isShuffleOn
    ? ["RANDOM"]
    : options?.sortBy ?? defaultSort

  return prisma.track
    .findMany(prismaOptions)
    .then(RA.map(removeNulledKeys))
    .then((tracks) => sortTracks(usedSort)(tracks as readonly ITrack[]))
    .then(E.right)
    .catch(createError("Failed getting tracks from database"))
}

export async function getCovers(
  _?: IHandlerEmitter,
  options?: Prisma.CoverFindManyArgs
): Promise<Either<IError, readonly ICover[]>> {
  return prisma.cover
    .findMany(options)
    .then(RA.map(removeNulledKeys))
    .then((covers) => E.right(covers as ICover[]))
    .catch(createError("Failed getting covers from database"))
}

export async function addTrackToDatabase(
  track: Prisma.TrackCreateInput
): Promise<Either<IError, ITrack>> {
  return prisma.track
    .upsert({
      where: {
        filepath: track.filepath,
      },
      update: track,
      create: track,
    })
    .then(removeNulledKeys)
    .then((addedTrack) => E.right(addedTrack as ITrack))
    .catch(createError("Failed adding track to database"))
}

export async function deleteTracksInverted(
  filepaths: readonly FilePath[]
): Promise<Either<IError, number>> {
  const pathsString = filepaths
    .map((path) => path.replace(/'/g, "''")) // Prevent the query from breaking if a value contains single quote(s)
    .map((path) => `'${path}'`)
    .join(",")

  const query = `DELETE FROM 
                  ${SQL.TRACK} 
                 WHERE 
                  ${SQL.filepath} NOT IN (${pathsString})`

  return prisma
    .$executeRawUnsafe(query)
    .then((deleteAmount) => E.right(deleteAmount))
    .catch(createError("Failed removing unused tracks from the database"))
}

export async function deleteEmptyAlbums(): Promise<Either<IError, number>> {
  const query = `
    DELETE FROM
      ${SQL.ALBUM}
    WHERE
      ${SQL.name} in (
        SELECT
          ${SQL["ALBUM.name"]}
        FROM
          ${SQL.ALBUM}
          LEFT JOIN ${SQL.TRACK} ON ${SQL["ALBUM.name"]} = ${SQL["TRACK.album"]}
        WHERE
          ${SQL["TRACK.title"]} IS NULL
      )`

  return prisma
    .$executeRawUnsafe(query)
    .then((deleteAmount) => E.right(deleteAmount))
    .catch(createError("Failed removing unused albums from the database"))
}

export async function deleteEmptyArtists(): Promise<Either<IError, number>> {
  const query = `
    DELETE FROM
      ${SQL.ARTIST}
    WHERE
      ${SQL.name} in (
        SELECT
          ${SQL["ARTIST.name"]}
        FROM
          ${SQL.ARTIST}
          LEFT JOIN ${SQL.TRACK} ON ${SQL["ARTIST.name"]} = ${SQL["TRACK.artist"]}
        WHERE
          ${SQL["TRACK.title"]} IS NULL
      )`

  return prisma
    .$executeRawUnsafe(query)
    .then((deleteAmount) => E.right(deleteAmount))
    .catch(createError("Failed removing unused artists from the database"))
}

export async function deleteUnusedCoversInDatabase(): Promise<
  Either<IError, number>
> {
  const query = `
    DELETE FROM
      ${SQL.COVER}
    WHERE
      ${SQL.filepath} in (
        SELECT
          ${SQL["COVER.filepath"]}
        FROM
          ${SQL.COVER}
          LEFT JOIN ${SQL.TRACK} ON ${SQL["COVER.filepath"]} = ${SQL["TRACK.cover"]}
        WHERE
          ${SQL["TRACK.cover"]} IS NULL
      )`

  return prisma
    .$executeRawUnsafe(query)
    .then((deleteAmount) => E.right(deleteAmount))
    .catch(createError("Failed removing unused covers from the database"))
}

function createError(
  type: IErrorTypes
): (error: unknown) => Either<IError, never> {
  return (error) => {
    if (typeof error !== "object" || error === null)
      return E.left({ type, error })

    if (!isKeyOfObject(error, "message")) return E.left({ type, error })

    console.group("Error")
    log.error.red(type, error)
    log.error.red(type, error?.message)
    console.groupEnd()

    return E.left({
      type,
      error: { ...error, message: error.message },
    })
  }
}

function addArtistImage<T extends { albums: readonly { cover?: string }[] }>(
  artist: T
): T {
  // Get the artist image from one of his album covers. Later we will use an API for that
  const image = artist.albums.find(({ cover }) => cover !== undefined)?.cover

  return {
    ...artist,
    image,
  }
}

function insertTracksIntoPlaylist(
  { id }: IPlaylist,
  insertionIndex: number
): (trackIDs: readonly ITrackID[]) => Promise<Either<IError, IPlaylist>> {
  return async (trackIDs) => {
    const currentItems: Either<
      IError,
      readonly Prisma.PlaylistItemUncheckedCreateInput[]
    > = pipe(
      await getPlaylistWithItems(undefined, id),
      E.map((playlist) =>
        pipe(
          playlist,
          // Get the items
          ({ items }) => items,
          // Remove the ID, but keep the rest.
          RA.map(({ trackID, playlistID, index }) => ({
            trackID,
            playlistID,
            index,
          }))
        )
      )
    )

    if (E.isLeft(currentItems)) {
      return currentItems // Return the error
    }

    const itemsToInsert = trackIDs.map(createPlaylistItem(id, insertionIndex))

    return pipe(
      currentItems.right,

      insertIntoArray(insertionIndex, itemsToInsert),

      // Recalculate the index
      (items) => items.map((item, index) => ({ ...item, index })),

      // Add to the database
      (newItems) =>
        prisma.playlist
          .update({ where: { id }, data: { items: { create: newItems } } })
          .then((playlist) => E.right(playlist as IPlaylist))
          .catch(createError("Failed updating playlist"))
    )
  }
}

function appendTracksToPlaylist({
  id,
}: IPlaylist): (
  trackIDs: readonly ITrackID[]
) => Promise<Either<IError, readonly IPlaylistItem[]>> {
  return async (trackIDs: readonly ITrackID[]) => {
    const currentLastIndex = await prisma.playlist.count({
      where: { id },
    })

    const itemsToAppend = trackIDs.map(createPlaylistItem(id, currentLastIndex))

    return addPlaylistItemsToDatabase(itemsToAppend)
  }
}

async function addPlaylistItemsToDatabase(
  items: readonly Prisma.PlaylistItemUncheckedCreateInput[]
): Promise<Either<IError, readonly IPlaylistItem[]>> {
  const itemsToAdd: Prisma.Prisma__PlaylistItemClient<PlaylistItem, never>[] =
    items.map((data) => prisma.playlistItem.create({ data }))

  return prisma
    .$transaction(itemsToAdd)
    .then((createdItems) => E.right(createdItems as IPlaylistItem[]))
    .catch(createError("Failed adding items to playlist"))
}
