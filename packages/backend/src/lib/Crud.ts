import { removeNulledKeys } from "@sing-shared/Pures"
import { isKeyOfObject } from "@sing-types/Typeguards"
import { left, right } from "fp-ts/Either"
import log from "ololog"

import createPrismaClient from "./CustomPrismaClient"

import type { Prisma } from "@prisma/client"
import type {
  IAlbum,
  IError,
  ITrack,
  ICover,
  IArtist,
  IAlbumWithTracks,
  IErrorTypes,
} from "@sing-types/Types"
import type { Either } from "fp-ts/Either"
import type { FilePath } from "@sing-types/Filesystem"

const prisma = createPrismaClient()

export async function getTracks(
  options?: Prisma.TrackFindManyArgs
): Promise<Either<IError, ITrack[]>> {
  try {
    const result = (await prisma.track.findMany(options)) as ITrack[]

    return right(result)
  } catch (error) {
    return createError(error, "Failed to get from database")
  }
}

export async function getAlbums(
  options?: Prisma.AlbumFindManyArgs
): Promise<Either<IError, IAlbum[]>> {
  try {
    const result = (await prisma.album.findMany(options)) as IAlbum[]

    return right(result)
  } catch (error) {
    return createError(error, "Failed to get from database")
  }
}

export async function getAlbum(
  options: Prisma.AlbumFindUniqueOrThrowArgs
): Promise<Either<IError, IAlbumWithTracks>> {
  try {
    const usedOptions: Prisma.AlbumFindUniqueOrThrowArgs = {
      include: { tracks: true },
      ...options,
    }

    const result = (await prisma.album.findUniqueOrThrow(
      usedOptions
    )) as IAlbumWithTracks

    return right(result)
  } catch (error) {
    return createError(error, "Failed to get from database")
  }
}

export async function getCovers(
  options?: Prisma.CoverFindManyArgs
): Promise<Either<IError, ICover[]>> {
  try {
    const result = (await prisma.cover.findMany(options)) as ICover[]

    return right(result)
  } catch (error) {
    return createError(error, "Failed to get from database")
  }
}

export async function getArtists(
  options?: Prisma.ArtistFindManyArgs
): Promise<Either<IError, IArtist[]>> {
  try {
    log(options)

    const result = (await prisma.artist.findMany(options)) as IArtist[]

    return right(result)
  } catch (error) {
    return createError(error, "Failed to get from database")
  }
}

export async function getArtist(
  options: Prisma.ArtistFindUniqueOrThrowArgs
): Promise<Either<IError, IArtist>> {
  try {
    const result = (await prisma.artist.findUniqueOrThrow(options)) as IArtist

    return right(result)
  } catch (error) {
    return createError(error, "Failed to get from database")
  }
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
    .then((addedTrack) => right(removeNulledKeys(addedTrack) as ITrack))
    .catch((error) => createError(error, "Failed to add track to database"))
}

export async function deleteTracksInverted(
  filepaths: FilePath[]
): Promise<Either<IError, number>> {
  const pathsString = filepaths
    .map((path) => path.replace("'", "''")) // Prevent the query from breaking if a values contains a single quote
    .map((path) => `'${path}'`)
    .join(",")

  return prisma
    .$executeRawUnsafe(
      `DELETE FROM TRACK WHERE FILEPATH NOT IN (${pathsString})`
    )
    .then((deleteAmount) => right(deleteAmount))
}

export async function deleteEmptyAlbums(): Promise<Either<IError, number>> {
  return prisma.$executeRaw`
    DELETE FROM
      ALBUM
    WHERE
      name in (
        SELECT
          ALBUM.name
        FROM
          ALBUM
          LEFT JOIN TRACK ON Album.name = TRACK.albumName
        WHERE
          TRACK.title IS NULL
      )`
    .then((deleteAmount) => right(deleteAmount))
    .catch((error) => createError(error, "Failed to remove from database"))
}

export async function deleteEmptyArtists(): Promise<Either<IError, number>> {
  return prisma.$executeRaw`
    DELETE FROM
      ARTIST
    WHERE
      name in (
        SELECT
          ARTIST.name
        FROM
          ARTIST
          LEFT JOIN TRACK ON ARTIST.name = TRACK.artistName
        WHERE
          TRACK.title IS NULL
      )`.then((deleteAmount) => right(deleteAmount))
}

export async function deleteUnusedCoversInDatabase(): Promise<
  Either<IError, number>
> {
  return prisma.$executeRaw`
    DELETE FROM
      COVER
    WHERE
      filepath in (
        SELECT
          COVER.filepath
        FROM
          COVER
          LEFT JOIN TRACK ON COVER.filepath = TRACK.coverPath
        WHERE
          TRACK.coverPath IS NULL
      )`.then((deleteAmount) => right(deleteAmount))
}

function createError(error: unknown, type: IErrorTypes): Either<IError, never> {
  if (typeof error !== "object" || error === null) return left({ type, error })

  if (!isKeyOfObject(error, "message")) return left({ type, error })

  log.error.red(error?.message)

  return left({
    type,
    error: { ...error, message: error.message },
  })
}
