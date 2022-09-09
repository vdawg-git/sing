import { removeNulledKeys } from "@sing-shared/Pures"
import { isKeyOfObject } from "@sing-types/Typeguards"
import { left, right } from "fp-ts/Either"
import { map as mapArray } from "fp-ts/lib/ReadonlyArray"
import log from "ololog"

import { SQL_STRINGS as S } from "./Consts"
import createPrismaClient from "./CustomPrismaClient"

import type { Prisma } from "@prisma/client"
import type {
  IAlbum,
  IError,
  ITrack,
  ICover,
  IArtist,
  IErrorTypes,
} from "@sing-types/Types"
import type { Either } from "fp-ts/Either"
import type { FilePath } from "@sing-types/Filesystem"

const prisma = createPrismaClient()

// TODO Update changed covers correctly (now they are getting deleted for whatever reason)

export async function getTracks(
  options?: Prisma.TrackFindManyArgs
): Promise<Either<IError, readonly ITrack[]>> {
  return prisma.track
    .findMany(options)
    .then(mapArray(removeNulledKeys))
    .then((tracks) => right(tracks as ITrack[]))
    .catch(createError("Failed to get from database"))
}

export async function getAlbums(
  options?: Prisma.AlbumFindManyArgs
): Promise<Either<IError, IAlbum[]>> {
  return prisma.album
    .findMany({
      orderBy: { name: "asc" },
      ...options,
      include: {
        tracks: true,
        ...options?.include,
      },
    })
    .then((albums) => albums.map(removeNulledKeys) as unknown as IAlbum[])
    .then(right)
    .catch(createError("Failed to remove unused albums from the database"))
}

export async function getAlbum(
  options: Prisma.AlbumFindUniqueOrThrowArgs
): Promise<Either<IError, IAlbum>> {
  const usedOptions: Prisma.AlbumFindUniqueOrThrowArgs = {
    include: { tracks: true },
    ...options,
  }

  return prisma.album
    .findUniqueOrThrow(usedOptions)
    .then(removeNulledKeys)
    .then((album) => right(album as IAlbum))
    .catch(createError("Failed to get from database"))
}

export async function getCovers(
  options?: Prisma.CoverFindManyArgs
): Promise<Either<IError, ICover[]>> {
  return prisma.cover
    .findMany(options)
    .then(mapArray(removeNulledKeys))
    .then((covers) => right(covers as ICover[]))
    .catch(createError("Failed to get from database"))
}

export async function getArtists(
  options?: Prisma.ArtistFindManyArgs
): Promise<Either<IError, IArtist[]>> {
  const usedOptions: Prisma.ArtistFindManyArgs = {
    orderBy: { name: "asc" },
    ...(options && { options }),
    include: {
      ...(options?.include && { ...options.include }),
      albums: {
        include: {
          coverPath: true,
        },
      },
    },
  }

  return prisma.artist
    .findMany(usedOptions)
    .then(mapArray(removeNulledKeys))
    .then((artists) => right(artists as IArtist[]))
    .catch(createError("Failed to get from database"))
}

export async function getArtist(
  options: Prisma.ArtistFindUniqueOrThrowArgs
): Promise<Either<IError, IArtist>> {
  const usedOptions: Prisma.ArtistFindUniqueOrThrowArgs = {
    ...options,
    include: {
      ...options.include,
      albums: {
        include: {
          coverPath: true,
        },
      },
    },
  }

  return prisma.artist
    .findUniqueOrThrow(usedOptions)
    .then(removeNulledKeys)
    .then((artist) => right(artist as unknown as IArtist))
    .catch(createError("Failed to get from database"))
}

export async function addTrackToDB(
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
    .then((addedTrack) => right(addedTrack as ITrack))
    .catch(createError("Failed to add track to database"))
}

export async function deleteTracksInverted(
  filepaths: readonly FilePath[]
): Promise<Either<IError, number>> {
  const pathsString = filepaths
    .map((path) => path.replace(/'/g, "''")) // Prevent the query from breaking if a value contains single quote(s)
    .map((path) => `'${path}'`)
    .join(",")

  const query = `DELETE FROM ${S.TRACK} WHERE ${S.filepath} NOT IN (${pathsString})`

  return prisma
    .$executeRawUnsafe(query)
    .then((deleteAmount) => right(deleteAmount))
    .catch(createError("Failed to remove unused tracks from the database"))
}

export async function deleteEmptyAlbums(): Promise<Either<IError, number>> {
  const query = `
    DELETE FROM
      ${S.ALBUM}
    WHERE
      ${S.name} in (
        SELECT
          ${S["ALBUM.name"]}
        FROM
          ${S.ALBUM}
          LEFT JOIN ${S.TRACK} ON ${S["ALBUM.name"]} = ${S["TRACK.album"]}
        WHERE
          ${S["TRACK.title"]} IS NULL
      )`

  return prisma
    .$executeRawUnsafe(query)
    .then((deleteAmount) => right(deleteAmount))
    .catch(createError("Failed to remove unused albums from the database"))
}

export async function deleteEmptyArtists(): Promise<Either<IError, number>> {
  const query = `
    DELETE FROM
      ${S.ARTIST}
    WHERE
      ${S.name} in (
        SELECT
          ${S["ARTIST.name"]}
        FROM
          ${S.ARTIST}
          LEFT JOIN ${S.TRACK} ON ${S["ARTIST.name"]} = ${S["TRACK.artist"]}
        WHERE
          ${S["TRACK.title"]} IS NULL

      )`

  return prisma
    .$executeRawUnsafe(query)
    .then((deleteAmount) => right(deleteAmount))
    .catch(createError("Failed to remove unused artists from the database"))
}

export async function deleteUnusedCoversInDatabase(): Promise<
  Either<IError, number>
> {
  const query = `
    DELETE FROM
      ${S.COVER}
    WHERE
      ${S.filepath} in (
        SELECT
          ${S["COVER.filepath"]}
        FROM
          ${S.COVER}
          LEFT JOIN ${S.TRACK} ON ${S["COVER.filepath"]} = ${S["TRACK.cover"]}
        WHERE
          ${S["TRACK.cover"]} IS NULL
      )`

  return prisma
    .$executeRawUnsafe(query)
    .then((deleteAmount) => right(deleteAmount))
    .catch(createError("Failed to remove unused covers from the database"))
}

function createError(
  type: IErrorTypes
): (error: unknown) => Either<IError, never> {
  return (error) => {
    if (typeof error !== "object" || error === null)
      return left({ type, error })

    if (!isKeyOfObject(error, "message")) return left({ type, error })

    log.error.red(error)

    return left({
      type,
      error: { ...error, message: error.message },
    })
  }
}
