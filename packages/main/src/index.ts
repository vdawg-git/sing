import { app } from "electron"
import { restoreOrCreateWindow } from "@/mainWindow"
import { checkDatabase } from "./Helper"
import ipc from "../../preload/src/ipcMain"
import log from "ololog"
import { dbPath } from "./Consts"

log.noLocate.inverse("  Main script started  ")
log.noLocate(import.meta.env.DEV ? "Dev mode" : "production mode")

checkDatabase(dbPath)

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
