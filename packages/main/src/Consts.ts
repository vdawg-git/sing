import { app } from "electron"
import path from "node:path"
import slash from "slash"

export const developmentDBPath = slash(
  path.join(app.getPath("userData"), "devDB.db")
)
export const productionDBPath = slash(
  path.join(app.getPath("userData"), "productionDB.db")
)
export const databasePath = import.meta.env.DEV
  ? developmentDBPath
  : productionDBPath
export const databaseURL = `file:${databasePath}`

export const coversDirectory = `${slash(app.getPath("userData"))}/covers/`
