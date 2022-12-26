import path from "node:path"

import { app } from "electron"
import slash from "slash"

import type { IElectronPaths } from "@sing-types/Types"
import type { DirectoryPath, FilePath } from "@sing-types/Filesystem"

export const isDevelopment = process.env.NODE_ENV === "development"

export const developmentDBPath = slash(
  path.join(app.getPath("userData"), "devDB.db")
) as FilePath

export const productionDBPath = slash(
  path.join(app.getPath("userData"), "productionDB.db")
) as FilePath

export const databasePath = isDevelopment ? developmentDBPath : productionDBPath
export const databaseURL = `file:${databasePath}`

export const coversDirectory = `${slash(
  app.getPath("userData")
)}/covers/` as DirectoryPath

export const electronPaths = [
  "home",
  "appData",
  "userData",
  "sessionData",
  "temp",
  "exe",
  "module",
  "desktop",
  "documents",
  "downloads",
  "music",
  "pictures",
  "videos",
  "recent",
  "logs",
  "crashDumps",
] satisfies readonly IElectronPaths[]

// Hacky, but putting this here because otherwise at query time the Prisma client
// gives an error "Environment variable not found: DATABASE_URL" despite us passing
// the dbUrl into the prisma client constructor in datasources.db.url
process.env.DATABASE_URL = databaseURL

// This needs to be updated every time you create a migration!
export const latestMigration = "20221225161131_init"
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const platformToExecutables: any = {
  win32: {
    migrationEngine:
      "node_modules/@prisma/engines/migration-engine-windows.exe",
    queryEngine: "node_modules/@prisma/engines/query_engine-windows.dll.node",
  },
  linux: {
    migrationEngine:
      "node_modules/@prisma/engines/migration-engine-debian-openssl-1.1.x",
    queryEngine:
      "node_modules/@prisma/engines/libquery_engine-debian-openssl-1.1.x.so.node",
  },
  darwin: {
    migrationEngine: "node_modules/@prisma/engines/migration-engine-darwin",
    queryEngine:
      "node_modules/@prisma/engines/libquery_engine-darwin.dylib.node",
  },
  darwinArm64: {
    migrationEngine:
      "node_modules/@prisma/engines/migration-engine-darwin-arm64",
    queryEngine:
      "node_modules/@prisma/engines/libquery_engine-darwin-arm64.dylib.node",
  },
}

const extraResourcesPath = app.getAppPath().replace("app.asar", "") // impacted by extraResources setting in electron-builder.yml

function getPlatformName() {
  const isDarwin = process.platform === "darwin"
  if (isDarwin && process.arch === "arm64") {
    return process.platform + "Arm64"
  }

  return process.platform
}

const platformName = getPlatformName()

export const migrationEnginePath = path.join(
  extraResourcesPath,
  platformToExecutables[platformName].migrationEngine
)
export const queryEnginePath = path.join(
  extraResourcesPath,
  platformToExecutables[platformName].queryEngine
)
