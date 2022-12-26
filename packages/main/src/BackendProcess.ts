import { fork } from "node:child_process"
import path from "node:path"

import { databaseURL, queryEnginePath } from "./Constants"
import {
  createBackendEmitter,
  createBackendEnquirer,
  logProcessOutput,
} from "./Helper"

export const backendProcess = fork(
  path.join(__dirname, "../../backend/src/index.cjs"),
  [databaseURL, queryEnginePath]
)

logProcessOutput(backendProcess, "backend")

export const queryBackend = createBackendEnquirer(backendProcess)
export const emitToBackend = createBackendEmitter(backendProcess)
