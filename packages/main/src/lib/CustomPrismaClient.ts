import { PrismaClient } from "@prisma/client"
import { app } from "electron"
import { join } from "path"

export const devDBPath = join(app.getPath("userData"), "devDB.db")
export const productionDBPath = join(app.getPath("userData"), "productionDB.db")
export const dbPath = import.meta.env.DEV ? devDBPath : productionDBPath
console.log(dbPath)

export const url = "file:" + dbPath

export default function createPrismaClient() {
  return new PrismaClient({
    datasources: {
      db: { url },
    },
  })
}
