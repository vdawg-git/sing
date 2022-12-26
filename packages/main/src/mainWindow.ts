import { join } from "node:path"
import { URL } from "node:url"
import os from "node:os"

import { BrowserWindow } from "electron"

// @ts-expect-error
import tailwind from "../../../tailwind.config.cjs"

import { isDevelopment } from "./Constants.js"

const osName = os.platform()

async function createWindow() {
  const browserWindow = new BrowserWindow({
    show: isDevelopment, // Use 'ready-to-show' event to show window when in production
    webPreferences: {
      preload: join(__dirname, "./preload.cjs"),
      webSecurity: false,
    },
    backgroundColor: tailwind.theme.colors.grey[900],

    // Disable native frame on Windows to show a completly custom title bar.
    frame: osName === "darwin" ? true : false,
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 8, y: 4 },
    fullscreenable: false,

    width: 1280,
    height: 744,
    minHeight: 720,
    minWidth: 1040,
  })

  /**
   * If you install `show: true` then it can cause issues when trying to close the window.
   * Use `show: false` and listener events `ready-to-show` to fix these issues.
   *
   * Do however use it in dev to make location.reload() work properly
   *
   * @see https://github.com/electron/electron/issues/25012
   */
  browserWindow.on("ready-to-show", () => {
    if (!isDevelopment) browserWindow?.show() // this repositions the window and is annoying when in development

    browserWindow.webContents.openDevTools()
    if (isDevelopment) {
      browserWindow.webContents.openDevTools()
    }
  })

  /**
   * URL for main window.
   * Vite dev server for development.
   * `file://../renderer/index.html` for production and test
   */
  const pageUrl = isDevelopment
    ? "http://localhost:5173/"
    : new URL("../renderer/index.html", `file://${__dirname}`).toString()

  await browserWindow.loadURL(pageUrl)

  return browserWindow
}

/**
 * Restore existing BrowserWindow or Create new BrowserWindow
 */
export async function restoreOrCreateWindow() {
  let window = BrowserWindow.getAllWindows().find(
    (rendererWindow) => !rendererWindow.isDestroyed()
  )
  if (window === undefined) {
    window = await createWindow()
  }
  if (window.isMinimized()) {
    window.restore()
  }
  window.focus()
}
