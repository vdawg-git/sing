import path from "node:path"
import log from "ololog"
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
    executablePath,
  })

  // electronApp.on("window", (page) => page.on("console", log))

  // await electronApp.waitForEvent("window")

  return electronApp
}

export function convertDisplayTimeToSeconds(displayTime: string) {
  const [minutes, seconds] = displayTime.split(":").map(Number)

  return minutes * 60 + seconds
}

export function isImageElement(element: Element): element is HTMLImageElement {
  return element?.tagName === "IMG"
}

export function isSVGElement(element: Element): element is SVGElement {
  if (element.nodeName === "svg") return true

  return false
}

export function isMediaElement(element: Element): element is HTMLMediaElement {
  if (element.nodeName === "audio") return true
  if (element.nodeName === "video") return true

  return false
}
