import { removeNulledKeys } from "@sing-shared/Pures"
import { left, right } from "fp-ts/Either"

import createPrismaClient from "./CustomPrismaClient"

import type { IError, ITrack } from "@sing-types/Types"
import type { Either } from "fp-ts/Either"

import type { Prisma } from "@prisma/client"

const prisma = createPrismaClient()

export async function getTracks(
  options: Prisma.TrackFindManyArgs | undefined
): Promise<Either<IError, ITrack[]>> {
  try {
    const result = await prisma.track.findMany(options)

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
    .then((addedTrack) => right(removeNulledKeys(addedTrack)))
    .catch((error) =>
      left({
        type: "Failed to add track to database",
        error,
        message: `Failed to add track: ${error.message}`,
      })
    )
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
