import { PrismaClient } from "@prisma/client"
import path from "node:path"

export const databasePath = path.join(__dirname, "testDB.db")
export const url = `file:${databasePath}`

export default function createPrismaClient() {
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
