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
  options: [Prisma.TrackFindManyArgs | undefined]
): Promise<Either<IError, ITrack[]>> {
  try {
    const result = (await prisma.track.findMany(...options)) as ITrack[]

    return right(result)
  } catch (error) {
    return createError(error, "Failed to get from database")
  }
}

export async function getAlbums(
  options: [Prisma.AlbumFindManyArgs | undefined]
): Promise<Either<IError, IAlbum[]>> {
  try {
    const result = (await prisma.album.findMany(...options)) as IAlbum[]

    return right(result)
  } catch (error) {
    return createError(error, "Failed to get from database")
  }
}

export async function getAlbum(
  options: [Prisma.AlbumFindUniqueOrThrowArgs]
): Promise<Either<IError, IAlbumWithTracks>> {
  try {
    const usedOptions: Prisma.AlbumFindUniqueOrThrowArgs = {
      include: { tracks: true },
      ...options[0],
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
  options: Prisma.CoverFindManyArgs | undefined
): Promise<Either<IError, ICover[]>> {
  try {
    const result = (await prisma.cover.findMany(options)) as ICover[]

    return right(result)
  } catch (error) {
    return createError(error, "Failed to get from database")
  }
}

export async function getArtists(
  options: [Prisma.ArtistFindManyArgs | undefined]
): Promise<Either<IError, IArtist[]>> {
  try {
    log(options)

    const result = (await prisma.artist.findMany(...options)) as IArtist[]

    return right(result)
  } catch (error) {
    return createError(error, "Failed to get from database")
  }
}

export async function getArtist(
  options: [Prisma.ArtistFindUniqueOrThrowArgs]
): Promise<Either<IError, IArtist>> {
  try {
    const result = (await prisma.artist.findUniqueOrThrow(
      ...options
    )) as IArtist

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
  return prisma.track
    .deleteMany({
      where: {
        filepath: { notIn: filepaths },
      },
    })
    .then((deleteAmount) => right(deleteAmount.count))
    .catch((error) => createError(error, "Failed to remove from database"))
}

export async function deleteAlbumsInverted(
  names: string[]
): Promise<Either<IError, number>> {
  return prisma.album
    .deleteMany({
      where: {
        name: { notIn: names },
      },
    })
    .then((deleteAmount) => right(deleteAmount.count))
    .catch((error) => createError(error, "Failed to remove from database"))
}

export async function deleteArtistsInverted(
  names: string[]
): Promise<Either<IError, number>> {
  return prisma.artist
    .deleteMany({
      where: {
        name: { notIn: names },
      },
    })
    .then((deleteAmount) => right(deleteAmount.count))
    .catch((error) => createError(error, "Failed to remove from database"))
}

export async function deleteCoversInverted(
  filepaths: string[]
): Promise<Either<IError, number>> {
  return prisma.cover
    .deleteMany({
      where: {
        filepath: { notIn: filepaths },
      },
    })
    .then((deleteAmount) => right(deleteAmount.count))
    .catch((error) => createError(error, "Failed to remove from database"))
}

function createError(error: unknown, type: IErrorTypes): Either<IError, never> {
  if (typeof error !== "object" || error === null) return left({ type, error })

  if (!isKeyOfObject(error, "message")) return left({ type, error })

  log(error?.message)

  return left({
    type,
    error: { ...error, message: error.message },
  })
}
