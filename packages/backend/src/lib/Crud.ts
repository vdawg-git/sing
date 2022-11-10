import * as E from "fp-ts/Either"
import * as RA from "fp-ts/lib/ReadonlyArray"
import { pipe } from "fp-ts/lib/function"
import { omit } from "fp-ts-std/Struct"
import log from "ololog"
import { match, P } from "ts-pattern"
import { isDefined } from "ts-is-present"

import {
  createSQLArray,
  insertIntoArray,
  removeDuplicates,
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
  IPlaylistItem,
  IPlaylistGetArgument,
  IPlaylistWithTracks,
  IPlaylistTrack,
  IPlaylistCreateArgument,
  IMusicIDsUnion,
  IRemoveTracksFromPlaylistArgument,
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
  _: IHandlerEmitter | undefined,
  options?: IPlaylistFindManyArgument
): Promise<Either<IError, readonly IPlaylist[]>> {
  const prismaOptions: Prisma.PlaylistFindManyArgs = {
    where: options?.where,
    include: {
      thumbnailCovers: true,
    },
  }

  const defaultSort: ISortOptions["playlists"] = ["name", "ascending"]

  return (
    prisma.playlist
      .findMany(prismaOptions)
      .then(RA.map(removeNulledKeys))
      .then((playlists) => sortByKey(options?.sortBy ?? defaultSort, playlists))

      // ! Add tracks support
      .then((playlists) => E.right(playlists as IPlaylist[]))
      .catch(createError("Failed to get playlists from database"))
  )
}

/**
 * Not used in the front-end. Just used internally by the back-end.
 */
async function getTracksFromPlaylists(
  options?: IPlaylistFindManyArgument
): Promise<Either<IError, readonly ITrack[]>> {
  const prismaOptions: Prisma.PlaylistFindManyArgs = {
    where: options?.where,
    include: {
      thumbnailCovers: true,
      items: { include: { track: true } },
    },
  }

  return prisma.playlist
    .findMany(prismaOptions)
    .then(RA.map(removeNulledKeys))
    .then((playlists) => playlists as IPlaylistWithItems[])
    .then(RA.map(({ items }) => items.map(({ track }) => track)))
    .then(RA.flatten)
    .then((tracks) => E.right(tracks as readonly ITrack[]))
    .catch(createError("Failed to get playlists from database"))
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
        include: { thumbnailCovers: true, items: { include: { track: true } } },
      })
      .then((playlist) => playlist as unknown as IPlaylistWithItems)
      // Convert the item[] to ( ITrack & {playlistIndex: number} )[]
      .then((playlist) => {
        const tracks: readonly IPlaylistTrack[] = playlist.items.map(
          (item) => ({
            ...(item.track as ITrack),
            manualOrderIndex: item.index,
          })
        )
        return pipe({ ...playlist, tracks }, omit(["items"]))
      })
      .then((playlist) =>
        updateKeyValue("tracks", sortTracks(usedSort), playlist)
      )
      .then(removeNulledKeys)
      .then((playlist) => E.right(playlist as IPlaylistWithTracks))
      .catch(createError("Failed to get playlist from database"))
  )
}

/**
 * Used internally and not exposed to the front-end.
 * This gets the playlist with its database items, which are not tracks, but wrapper of tracks and their index within the playlist.
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
    .then((playlist) => E.right(playlist as IPlaylistWithItems))
    .catch(createError("Failed to get playlist from database"))
}

export async function createPlaylist(
  emitter: IHandlerEmitter,
  options?: IPlaylistCreateArgument
): Promise<Either<IError, IPlaylist>> {
  const playlistData: Either<IError, Prisma.PlaylistCreateArgs["data"]> =
    await match(options)
      .with(P.nullish, async () => {
        const usedNames = await getPlaylistNames()

        if (E.isLeft(usedNames)) return usedNames

        return E.right({ name: createDefaultPlaylistName(usedNames.right) })
      })
      .with(P.instanceOf(Object), async (toAdd) => {
        const tracksToAdd = await extractTracks(toAdd)

        if (E.isLeft(tracksToAdd)) return tracksToAdd

        const itemsToCreate = tracksToAdd.right.map(({ id }, index) => ({
          trackID: id,
          index,
        }))

        const covers: Prisma.CoverWhereUniqueInput[] = tracksToAdd.right
          .map(({ cover }) => cover)
          .filter(isDefined)
          .filter(removeDuplicates)
          .slice(0, 4)
          .map((filepath) => ({ filepath }))

        const data: Prisma.PlaylistCreateArgs["data"] = {
          name: toAdd.name,
          items: { create: itemsToCreate },
          ...(covers.length > 0 && { thumbnailCovers: { connect: covers } }),
        }

        return E.right(data)
      })
      .exhaustive()

  if (E.isLeft(playlistData)) {
    emitter.emit("sendToMain", {
      event: "createNotification",
      data: { label: "Failed to create playlist", type: "danger" },
      forwardToRenderer: true,
    })
    log.red.error(playlistData)
    return playlistData
  }

  return prisma.playlist
    .create({
      data: playlistData.right,
    })
    .then((newPlaylist) => {
      emitter.emit("sendToMain", {
        event: "playlistsUpdated",
        forwardToRenderer: true,
        data: undefined,
      })

      // If the playlist was created by a context menu action on a music item, which would mean the user was not automatically forwarded to the playlist, create a succes notification.
      // Currently options are not set through context menu creation
      if (options) {
        // TODO on click on the notification forward to the playlist
        emitter.emit("sendToMain", {
          event: "createNotification",
          forwardToRenderer: true,
          data: {
            label: `Created playlists ${options.name}.`,
            type: "default",
          },
        })
      }

      return pipe(newPlaylist, removeNulledKeys, (playlist) =>
        E.right(playlist as IPlaylist)
      )
    })
    .catch((error) => {
      emitter.emit("sendToMain", {
        event: "createNotification",
        data: { label: "Failed to create playlist", type: "danger" },
        forwardToRenderer: true,
      })
      log.red.error(error)

      return createError("Failed to create playlist at database")(error)
    })
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
    return createError("Failed to rename playlist at database")(error)
  }
}

export async function deletePlaylist(
  emitter: IHandlerEmitter,
  id: number
): Promise<Either<IError, number>> {
  // TODO let the renderer know that the playlist amount has changed. Probably need to implement some async events for that to work

  log({ id })

  try {
    const deletedPlaylist = await prisma.playlist.delete({ where: { id } })

    emitter.emit("sendToMain", {
      event: "playlistsUpdated",
      forwardToRenderer: true,
      data: undefined,
    })

    emitter.emit("sendToMain", {
      event: "createNotification",
      data: {
        label: `Deleted playlist ${deletedPlaylist.name}`,
        type: "check",
      },
      forwardToRenderer: true,
    })

    return E.right(id)
  } catch (error) {
    emitter.emit("sendToMain", {
      event: "createNotification",
      data: {
        label: `Failed to delete playlist.`,
        type: "warning",
      },
      forwardToRenderer: true,
    })
    return createError("Failed to delete playlist at database")(error)
  }
}

export type IAddTracksToPlaylistArgument = {
  readonly playlist: IPlaylist
  readonly musicToAdd: IMusicIDsUnion
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
  const trackIDs = pipe(
    await extractTracks(musicToAdd),
    E.map(RA.map(({ id }) => id))
  )

  if (E.isLeft(trackIDs)) {
    log.red.error(trackIDs.left)

    toMainEmitter.emit("sendToMain", {
      forwardToRenderer: true,
      event: "createNotification",
      data: {
        label: "Failed to update playlist. Could not get tracks from database.",
        type: "danger",
      },
    })
    return
  }

  const resultEither = await match(insertAt)
    .with(P.nullish, () => appendTracksToPlaylist(playlist)(trackIDs.right))
    .with(P.number, (insertIndex) =>
      insertTracksIntoPlaylist(playlist, insertIndex)(trackIDs.right)
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
          label: `Added ${musicToAdd.type} to playlist ${playlist.name}`,
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

export async function removeTracksFromPlaylist(
  mainEmitter: IHandlerEmitter,
  { id, trackIDs }: IRemoveTracksFromPlaylistArgument
): Promise<void> {
  prisma.playlist
    .update({
      where: { id },
      data: {
        items: {
          deleteMany: trackIDs.map((trackID) => ({ trackID: trackID })),
        },
      },
    })
    .then(() => {
      mainEmitter.emit("sendToMain", {
        event: "playlistUpdated",
        data: id,
        forwardToRenderer: true,
      })
    })
    .catch((error) => {
      log.error.red(error)
      mainEmitter.emit("sendToMain", {
        forwardToRenderer: true,
        event: "createNotification",
        data: {
          label: "Failed to delete track" + (trackIDs.length > 1 ? "s" : ""),
          type: "danger",
        },
      })
    })
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
    .then((artists) => E.right(artists as readonly IArtist[]))
    .catch(createError("Failed to get artists from database"))
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
    .catch(createError("Failed to get tracks from database"))
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
    .catch(createError("Failed to get albums from database"))
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
    .catch(createError("Failed to get album from database"))
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
    .catch(createError("Failed to get tracks from database"))
}

export async function getCovers(
  _?: IHandlerEmitter,
  options?: Prisma.CoverFindManyArgs
): Promise<Either<IError, readonly ICover[]>> {
  return prisma.cover
    .findMany(options)
    .then(RA.map(removeNulledKeys))
    .then((covers) => E.right(covers as ICover[]))
    .catch(createError("Failed to get covers from database"))
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
    .catch(createError("Failed to add track to database"))
}

export async function deleteTracksInverted(
  filepaths: readonly FilePath[]
): Promise<Either<IError, number>> {
  const pathsString = createSQLArray(filepaths)

  const query = `DELETE FROM 
                  ${SQL.Track} 
                 WHERE 
                  ${SQL.filepath} NOT IN (${pathsString})`

  return prisma
    .$executeRawUnsafe(query)
    .then((deleteAmount) => E.right(deleteAmount))
    .catch(createError("Failed to remove unused tracks from the database"))
}

export async function deleteEmptyAlbums(): Promise<Either<IError, number>> {
  const query = `
    DELETE FROM
      ${SQL.Album}
    WHERE
      ${SQL.name} in (
        SELECT
          ${SQL["Album.name"]}
        FROM
          ${SQL.Album}
          LEFT JOIN ${SQL.Track} ON ${SQL["Album.name"]} = ${SQL["Track.album"]}
        WHERE
          ${SQL["Track.title"]} IS NULL
      )`

  return prisma
    .$executeRawUnsafe(query)
    .then((deleteAmount) => E.right(deleteAmount))
    .catch(createError("Failed to remove unused albums from the database"))
}

export async function deleteEmptyArtists(): Promise<Either<IError, number>> {
  const query = `
    DELETE FROM
      ${SQL.Artist}
    WHERE
      ${SQL.name} in (
        SELECT
          ${SQL["Artist.name"]}
        FROM
          ${SQL.Artist}
          LEFT JOIN ${SQL.Track} ON ${SQL["Artist.name"]} = ${SQL["Track.artist"]}
        WHERE
          ${SQL["Track.title"]} IS NULL
      )`

  return prisma
    .$executeRawUnsafe(query)
    .then((deleteAmount) => E.right(deleteAmount))
    .catch(createError("Failed to remove unused artists from the database"))
}

export async function deleteUnusedCoversInDatabase(): Promise<
  Either<IError, number>
> {
  const query = `
    DELETE FROM
      ${SQL.Cover}
    WHERE
      ${SQL.filepath} in (
        SELECT
          ${SQL["Cover.filepath"]}
        FROM
          ${SQL.Cover}
          LEFT JOIN ${SQL.Track} ON ${SQL["Cover.filepath"]} = ${SQL["Track.cover"]}
        WHERE
          ${SQL["Track.cover"]} IS NULL
      )`

  return prisma
    .$executeRawUnsafe(query)
    .then((deleteAmount) => E.right(deleteAmount))
    .catch(createError("Failed to remove unused covers from the database"))
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
          .catch(createError("Failed to update playlist"))
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
    .catch(createError("Failed to add items to playlist"))
}

async function getPlaylistNames(): Promise<Either<IError, readonly string[]>> {
  return prisma.playlist
    .findMany({ select: { name: true } })
    .then(RA.map(({ name }) => name))
    .then(E.right)
    .catch(createError("Failed to get playlist names"))
}

async function extractTracks(
  item: IMusicIDsUnion
): Promise<Either<IError, readonly ITrack[]>> {
  return match(item)
    .with({ type: "artist" }, ({ name: artistNames }) => {
      if (Array.isArray(artistNames)) {
        return getTracksByArtistIDs(artistNames)
      }

      return getArtist(undefined, { where: { name: artistNames } }).then(
        E.map(({ tracks }) => tracks)
      )
    })

    .with({ type: "album" }, async ({ name: albumNames }) => {
      if (Array.isArray(albumNames)) {
        return getTracksByAlbumIDs(albumNames)
      }

      return getAlbum(undefined, { where: { name: albumNames } }).then(
        E.map(({ tracks }) => tracks)
      )
    })

    .with({ type: "track" }, ({ id: IDs }) => {
      if (Array.isArray(IDs)) return getTracksByIDs(IDs)

      return getTracks(undefined, {
        where: { id: IDs },
      })
    })

    .with({ type: "playlist" }, ({ id: IDs }) => {
      if (Array.isArray(IDs)) {
        return getTracksByPlaylistIDs(IDs)
      }

      return getTracksFromPlaylists({
        where: { id: { in: Array.isArray(IDs) ? [...IDs] : IDs } },
      })
    })

    .exhaustive()
}

async function getTracksByAlbumIDs(
  IDs: readonly string[]
): Promise<Either<IError, readonly ITrack[]>> {
  const IDsToInsert = createSQLArray(IDs)

  return prisma.$queryRaw`
    SELECT
      *
    FROM
      ${SQL.Track}
    WHERE
      ${SQL["Track.album"]} IN (${IDsToInsert})`

    .then((tracks) => tracks as readonly ITrack[])
    .then(RA.map(removeNulledKeys))
    .then(E.right)
    .catch(createError("Failed to get tracks from albums"))
}

async function getTracksByArtistIDs(
  IDs: readonly string[]
): Promise<Either<IError, readonly ITrack[]>> {
  const IDsToInsert = createSQLArray(IDs)

  return prisma.$queryRaw`
    SELECT
      *
    FROM
      ${SQL.Track}
    WHERE
      ${SQL["Track.artist"]} IN (${IDsToInsert})`

    .then((tracks) => tracks as readonly ITrack[])
    .then(RA.map(removeNulledKeys))
    .then(E.right)
    .catch(createError("Failed to get tracks from artists"))
}

async function getTracksByPlaylistIDs(
  IDs: readonly IPlaylistID[]
): Promise<Either<IError, readonly ITrack[]>> {
  const IDsToInsert = createSQLArray(IDs)

  return prisma.$queryRaw`
    SELECT
      ${SQL["Track.*"]}
    FROM
      ${SQL.PlaylistItem}
      JOIN ${SQL.Track} ON ${SQL["Track.id"]} = ${SQL["PlaylistItem.trackID"]}
    WHERE
      ${SQL["PlaylistItem.playlistID"]} IN (${IDsToInsert});`

    .then((tracks) => tracks as readonly ITrack[])
    .then(RA.map(removeNulledKeys))
    .then((tracks) => E.right(tracks as readonly ITrack[]))
    .catch(createError("Failed to get tracks from playlists"))
}

async function getTracksByIDs(
  IDs: readonly ITrackID[]
): Promise<Either<IError, readonly ITrack[]>> {
  const IDsToInsert = createSQLArray(IDs)

  return prisma.$queryRaw`
    SELECT
      *
    FROM
      ${SQL.Track}
    WHERE
      ${SQL["Track.id"]} IN (${IDsToInsert});`

    .then((tracks) => tracks as readonly ITrack[])
    .then(RA.map(removeNulledKeys))
    .then((tracks) => E.right(tracks as readonly ITrack[]))
    .catch(createError("Failed to get tracks from playlists"))
}
