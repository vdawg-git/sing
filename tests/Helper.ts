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
