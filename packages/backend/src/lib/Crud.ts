import { removeNulledKeys } from "@sing-shared/Pures"
import { left, right } from "fp-ts/Either"
import log from "ololog"

import createPrismaClient from "./CustomPrismaClient"

import type { Prisma } from "@prisma/client"
import type { IAlbum, IError, ITrack, ICover, IArtist } from "@sing-types/Types"
import type { Either } from "fp-ts/Either"
import type { FilePath } from "@sing-types/Filesystem"

const prisma = createPrismaClient()

export async function getTracks(
  options: Prisma.TrackFindManyArgs | undefined
): Promise<Either<IError, ITrack[]>> {
  try {
    const result = (await prisma.track.findMany(options)) as ITrack[]

    return right(result)
  } catch (error) {
    return left({ type: "Failed to get from database", error })
  }
}
export async function getAlbums(
  options: Prisma.AlbumFindManyArgs | undefined
): Promise<Either<IError, IAlbum[]>> {
  try {
    const result = (await prisma.album.findMany(options)) as IAlbum[]

    return right(result)
  } catch (error) {
    return left({ type: "Failed to get from database", error })
  }
}

export async function getCovers(
  options: Prisma.CoverFindManyArgs | undefined
): Promise<Either<IError, ICover[]>> {
  try {
    const result = (await prisma.cover.findMany(options)) as ICover[]

    return right(result)
  } catch (error) {
    return left({ type: "Failed to get from database", error })
  }
}

export async function getArtists(
  options: Prisma.ArtistFindManyArgs | undefined
): Promise<Either<IError, IArtist[]>> {
  try {
    const result = (await prisma.artist.findMany(options)) as IArtist[]

    return right(result)
  } catch (error) {
    return left({ type: "Failed to get from database", error })
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
    .catch((error) => {
      log.error(error.message)
      return left({
        type: "Failed to add track to database",
        error,
        message: `Failed to add track: ${error.message}`,
      })
    })
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
    .catch((error) => {
      console.error(error)
      return left({ error, type: "Failed to remove from database" })
    })
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
    .catch((error) => {
      console.error(error)
      return left({ error, type: "Failed to remove from database" })
    })
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
    .catch((error) => {
      console.error(error)
      return left({ error, type: "Failed to remove from database" })
    })
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
    .catch((error) => {
      console.error(error)
      return left({ error, type: "Failed to remove from database" })
    })
}
