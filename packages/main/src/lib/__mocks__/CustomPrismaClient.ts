import { PrismaClient } from "@prisma/client"
import { join } from "path"
import { vi } from "vitest"
const { promises } = await vi.importActual<typeof import("node:fs")>("node:fs")

export const devDBPath = join(__dirname, "testDB.db")
export const productionDBPath = join(__dirname, "testDB.db")
export const dbPath = devDBPath
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
