import path from "node:path"

import { PrismaClient } from "@sing-prisma"

export const databasePath = path.join(__dirname, "testDB.db")
export const url = `file:${databasePath}`

export function createPrismaClient() {
  return new PrismaClient({
    datasources: {
      db: { url },
    },
  })
}

const prisma = createPrismaClient()

export async function resetMockedPrisma() {
  return prisma.track.deleteMany()
}
