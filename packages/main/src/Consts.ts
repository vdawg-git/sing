import { join } from "path"
import { app } from "electron"

export const devDBPath = join(app.getPath("userData"), "devDB.db")
export const productionDBPath = join(app.getPath("userData"), "productionDB.db")
export const dbPath = import.meta.env.DEV ? devDBPath : productionDBPath

export const dbURL = "file:" + dbPath
