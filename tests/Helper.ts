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

  // const executablePath = path.join(
  //   __dirname,
  //   "./../node_modules/electron/dist/electron.exe"
  // )

  const electronApp = await electron.launch({
    args: ["."],
    bypassCSP: true,
    env: {
      ...process.env,
      NODE_ENV: "testing", // Acts like dev but loads files from disk instead of Vite
    },
  })

  // electronApp.on("window", (page) => page.on("console", console.log))

  return electronApp
}

/**
 * Return the folder name of the track title by taking its first letter
 */
export function getFolderFromTitle(title: string): number {
  const folder = title.at(0)

  if (!folder) throw new TypeError("Empty string passed to getFolderFromTitle")
  if (Number.isNaN(Number(folder)))
    throw new TypeError(`Invalid track title: ${title}`)

  return Number(title)
}

export function isMediaElement(
  element: HTMLElement | SVGElement
): element is HTMLMediaElement {
  if (element.nodeName === "AUDIO") return true
  if (element.nodeName === "VIDEO") return true

  return false
}

export function convertDisplayTimeToSeconds(displayTime: string) {
  const [minutes, seconds] = displayTime.split(":").map(Number)

  return minutes * 60 + seconds
}

/**
 * Get the track title for e2e from the rendered title
 * @param trackTitle - Title as rendered, for example: `01_Lorem Ipsum`
 * @returns Title for e2e testing like `01`
 */
export function getTrackTitle(trackTitle: string): string {
  return trackTitle.slice(0, 2)
}

/**
 * Checks if the provided string is an e2e track title like `01`, or `20`
 */
export function isE2ETrackTitle(trackTitle: string): boolean {
  return !!trackTitle.match(/^\d\d_$/)?.length
}

export function makeE2ETitle(trackTitle: string): string {
  return isE2ETrackTitle(trackTitle) ? trackTitle : trackTitle + "_"
}
