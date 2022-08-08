import { removeNulledKeys } from "@sing-shared/Pures"
import { left, right } from "fp-ts/Either"
import log from "ololog"

import createPrismaClient from "./CustomPrismaClient"

import type { Prisma } from "@prisma/client"
import type { IError, ITrack } from "@sing-types/Types"
import type { Either } from "fp-ts/Either"

const prisma = createPrismaClient()

export async function getTracks(
  options: Prisma.TrackFindManyArgs | undefined
): Promise<Either<IError, ITrack[]>> {
  try {
    const defaultOptions: Prisma.TrackFindManyArgs = {
      include: {
        cover: { select: { filepath: true } },
        artist: { select: { name: true } },
        album: { select: { name: true } },
        albumartist: { select: { name: true } },
      },
    } as const

    const result = (await prisma.track.findMany({
      ...defaultOptions,
      ...options,
    })) as ITrack[] //! TODO Fix the type

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
      include: {
        album: { select: { name: true } },
        cover: { select: { filepath: true } },
        albumartist: { select: { name: true } },
        artist: { select: { name: true } },
      },
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
  filepaths: string[]
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
