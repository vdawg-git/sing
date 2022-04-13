import type { Prisma } from "@prisma/client"
import createPrismaClient from "./CustomPrismaClient"

const prisma = createPrismaClient()

async function getTracks(options: Prisma.TrackFindManyArgs) {
  const result = await prisma.track.findMany(options)
  return result
}

export const Tracks = {
  get: getTracks,
}
