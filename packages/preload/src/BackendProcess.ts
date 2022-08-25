import { fork } from "node:child_process"
import path from "node:path"

import { databaseURL } from "../../main/src/Consts"
import { createBackendEmitter, createBackendEnquirer, logProcessOutput } from "./Helper"

export const backendProcess = fork(
  path.join(__dirname, "../../backend/dist/index.cjs"),
  [databaseURL]
)

logProcessOutput(backendProcess, "backend")

export const queryBackend = createBackendEnquirer(backendProcess)
export const emitToBackend = createBackendEmitter(backendProcess)
