import type { ElectronApplication } from "playwright"
import { _electron as electron } from "playwright"
import { join } from "path"

export async function launchElectron(): Promise<ElectronApplication> {
  const mainPath = join(
    __dirname,
    "..",
    "packages",
    "main",
    "dist",
    "index.cjs"
  )

  return electron.launch({
    args: [mainPath],
    bypassCSP: true,
  })
}

export function convertDisplayTimeToSeconds(displayTime: string) {
  const [minutes, seconds] = displayTime.split(":").map((x) => Number(x))

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
