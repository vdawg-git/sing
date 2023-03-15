/* eslint-disable unicorn/no-process-exit */
import { app } from "electron"
import debug from "electron-debug"
import c from "ansicolor"
import installExtension, { REDUX_DEVTOOLS } from "electron-devtools-installer"

import { restoreOrCreateWindow } from "./mainWindow"
import { ipcInit } from "./ipcMain"
import { checkDatabase } from "./Helper"
import { isDevelopment } from "./Constants"

console.log(c.bgBlack.blue("  Main script started   "))
console.log(c.bgBlack.magenta(isDevelopment ? "Dev mode" : "production mode"))

/**
 * Prevent multiple instances
 */
const isSingleInstance = app.requestSingleInstanceLock()
if (!isSingleInstance) {
  app.quit()
  process.exit(0)
}

debug() // Wont activate in production automatically

// First initialize or update the database, then open the UI
checkDatabase().then(() => {
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

  app.on("second-instance", restoreOrCreateWindow)
  /**
   * Create app window when background process will be ready
   */
  app
    .whenReady()
    .then(() =>
      installExtension
        // @ts-expect-error IDK why this is not exporting the default correctly
        .default(REDUX_DEVTOOLS)
        .then((name: string) => console.log(`Added Extension:  ${name}`))
        .catch((error: string) => console.log("An error occurred:", error))
    )
    .then(restoreOrCreateWindow)
    // eslint-disable-next-line unicorn/prefer-top-level-await
    .catch((error) => console.log("Failed create window:", error))

  // Load IPC handlers
  try {
    ipcInit()
  } catch (error) {
    console.log(error)
  }

  /**
   * Check new app version in production mode only
   */
  // if (!isDevelopment) {
  //   app
  //     .whenReady()
  //     .then(() => import("electron-updater"))
  //     .then(({ autoUpdater }) => autoUpdater.checkForUpdatesAndNotify())
  //     .catch((e) => console.error("Failed check updates:", e))
  // }
})
