import { PrismaClient } from "@prisma/client"
import { join } from "path"

export const dbPath = join(__dirname, "testDB.db")
export const url = "file:" + dbPath

export default function createPrismaClient() {
  return new PrismaClient({
    datasources: {
      db: { url },
    },
  })
}

const prisma = createPrismaClient()

export async function resetMockedPrisma() {
  return await prisma.track.deleteMany()
}
