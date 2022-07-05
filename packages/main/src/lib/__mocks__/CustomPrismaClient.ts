import { PrismaClient } from "@prisma/client"
import { join } from "path"
import { vi } from "vitest"
const { copyFileSync, existsSync } = await vi.importActual("node:fs")

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

// Check if database exists. If not copy the empty master to make it available
if (!existsSync(devDBPath)) {
  copyFileSync(join(__dirname, "../../../public/masterDB.db"), devDBPath)
}

// Reset database
const client = createPrismaClient()

resetMockedPrisma()

export function resetMockedPrisma() {
  client.track.deleteMany()
}
