import { join } from "node:path"
import { URL } from "node:url"

import { BrowserWindow } from "electron"

// @ts-expect-error
import tailwind from "../../../tailwind.config.cjs"

async function createWindow() {
  const browserWindow = new BrowserWindow({
    width: 1280,
    height: 744,
    show: import.meta.env.DEV, // Use 'ready-to-show' event to show window when in production
    frame: false, // Disable native frame
    webPreferences: {
      preload: join(__dirname, "../../preload/dist/index.cjs"),
      webSecurity: false,
    },
    backgroundColor: tailwind.theme.colors.grey[900],
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
    if (!import.meta.env.DEV) browserWindow?.show() // this repositions the window and is annoying when in development

    browserWindow.webContents.openDevTools()

    if (import.meta.env.DEV) {
      // Lets just always open devtools for now
    }
  })

  /**
   * URL for main window.
   * Vite dev server for development.
   * `file://../renderer/index.html` for production and test
   */
  const pageUrl =
    import.meta.env.DEV && import.meta.env.VITE_DEV_SERVER_URL !== undefined
      ? import.meta.env.VITE_DEV_SERVER_URL
      : new URL("../renderer/dist/index.html", `file://${__dirname}`).toString()

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
