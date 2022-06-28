import { app } from "electron"
import { restoreOrCreateWindow } from "@/mainWindow"
import { copyFileSync } from "fs"
import { checkPathExists } from "./Helper"
import { devDBPath, productionDBPath } from "./lib/CustomPrismaClient"
import { join } from "path"
import ipc from "../../preload/src/ipcMain"
import c from "ansicolor"

console.log(c.bgDarkGray.black("  Main script started  "))

// Check if database exists. If not copy the empty master to make it available
if (!checkPathExists(import.meta.env.DEV ? devDBPath : productionDBPath)) {
  if (import.meta.env.DEV) {
    copyFileSync(join(__dirname, "../public/masterDB.db"), devDBPath)
  } else {
    copyFileSync(join(__dirname, "masterDB.db"), productionDBPath)
  }
}

// Load IPC handlers
ipc()

/**
 * Prevent multiple instances
 */
const isSingleInstance = app.requestSingleInstanceLock()
if (!isSingleInstance) {
  app.quit()
  process.exit(0)
}
app.on("second-instance", restoreOrCreateWindow)

/**
 * Disable Hardware Acceleration for linux platforms
 */
// if (process.platform === "linux") app.disableHardwareAcceleration()

/**
 * Shout down background process if all windows was closed
 */
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

/**
 * @see https://www.electronjs.org/docs/v14-x-y/api/app#event-activate-macos Event: 'activate'
 */
app.on("activate", restoreOrCreateWindow)

/**
 * Create app window when background process will be ready
 */
app
  .whenReady()
  .then(restoreOrCreateWindow)
  .catch((e) => console.error("Failed create window:", e))

/**
 * Check new app version in production mode only
 */
// if (import.meta.env.PROD) {
//   app
//     .whenReady()
//     .then(() => import("electron-updater"))
//     .then(({ autoUpdater }) => autoUpdater.checkForUpdatesAndNotify())
//     .catch((e) => console.error("Failed check updates:", e))
// }
