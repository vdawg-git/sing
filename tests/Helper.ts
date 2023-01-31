import path from "node:path"

import { _electron as electron } from "playwright"

import type { ElectronApplication } from "playwright"

export async function launchElectron(): Promise<ElectronApplication> {
  // const mainPath = path.join(
  //   __dirname,
  //   "..",
  //   "packages",
  //   "main",
  //   "dist",
  //   "index.cjs"
  // )

  const executablePath = path.join(
    __dirname,
    "./../node_modules/electron/dist/electron.exe"
  )

  const electronApp = await electron.launch({
    args: ["."],
    bypassCSP: true,
    // executablePath,
  })

  // electronApp.on("window", (page) => page.on("console", log))

  // await electronApp.waitForEvent("window")

  return electronApp
}
