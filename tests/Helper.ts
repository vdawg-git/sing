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

export function isImage(element: Element): element is HTMLImageElement {
  return element?.tagName === "IMG"
}
