import { PrismaClient } from "@prisma/client"
import { app } from "electron"
import chalk from "chalk"
import path from "path"

export const url =
  "file:" +
  (!!import.meta.env.DEV
    ? path.join(__dirname, "./devDB.local.db") // get dev database path from here
    : path.join(app.getPath("userData"), "productionDB.db")) // get database path in user directory

export default function createPrismaClient() {
  console.log(chalk.blue(`Database url: ${url}`))

  return new PrismaClient({
    datasources: {
      db: { url },
    },
  })
}
