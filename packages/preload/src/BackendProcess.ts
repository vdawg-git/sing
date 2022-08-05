import { fork } from "node:child_process"
import path from "node:path"

import { databaseURL } from "../../main/src/Consts"
import { createBackendSender, createPromisifiedForkEmitter, logProcessOutput } from "./Helper"

export const backendProcess = fork(
  path.join(__dirname, "../../backend/dist/index.cjs"),
  [databaseURL]
)

logProcessOutput(backendProcess, "backend")

export const queryBackend = createPromisifiedForkEmitter(backendProcess)
export const emitToBackend = createBackendSender(backendProcess)
