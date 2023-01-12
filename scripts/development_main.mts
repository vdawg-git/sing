/* eslint-disable unicorn/no-process-exit */
import { spawn } from "node:child_process"
import readline from "node:readline"

import electronPath from "electron"
import { build } from "esbuild"
import { match } from "ts-pattern"
import c from "ansicolor"

import { externalizePrisma } from "./ExternalizePrisma.mjs"

import type { ChildProcess } from "node:child_process"

const actions = [
  ["a", "restart Electron"],
  ["c", "clear console - only works when not run concurrently"],
]

let electronApp: ChildProcess

readline.emitKeypressEvents(process.stdin)

process.stdin.on("keypress", handleKeypress)

process.stdin.setRawMode(true)

await new Promise((resolve) => {
  displayMessage()
  setTimeout(resolve, 150)
})

await build({
  entryPoints: [
    "./packages/backend/src/index.ts",
    "./packages/main/src/index.ts",
    "./packages/main/src/preload.ts",
  ],
  format: "cjs",
  platform: "node",
  bundle: true,
  write: true,
  outdir: "./dist",
  outExtension: { ".js": ".cjs" },
  sourcemap: "linked",
  keepNames: true,
  // "./packages/generated/*"
  external: ["electron"],
  plugins: [externalizePrisma],
  watch: true,
})

startElectron()

async function handleKeypress(ch: string, key: KeyStroke) {
  match(key)
    .with({ name: "c", shift: false, ctrl: true }, () => process.exit(0))
    .with({ name: "a" }, restartElectron)
    .with({ name: "o" }, console.clear)
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    .otherwise(() => {})
}

async function restartElectron() {
  console.log(
    "\n" + c.inverse(" # ") + c.bgBlue(" Starting Electron.. ") + "\n"
  )

  if (electronApp) {
    electronApp.kill()
    electronApp.removeAllListeners()
  }

  startElectron()

  electronApp.addListener("exit", () => {
    console.log(c.inverse(" - ") + c.bgYellow("Electron exited"))
    process.exit()
  })
}

function startElectron() {
  electronApp = spawn(String(electronPath), [".", "--trace-warnings"], {
    stdio: "inherit",
    env: { NODE_ENV: "development", NODE_OPTIONS: "--enable-source-maps" },
  })
}

function displayMessage() {
  const actionsString = actions
    .map(([key, action]) =>
      [c.blue(key), c.dim("to"), c.green(action)].join(" ")
    )
    .join("\n")

  console.log(`\n\n${c.green("Press")}\n${actionsString}\n`)
  console.log(
    `${c.dim(
      "When run concurrently via 'npm start' buttons need to be pressed twice"
    )}\n`
  )
}

type KeyStroke = {
  sequence: string
  name: string
  ctrl: boolean
  meta: boolean
  shift: boolean
}
