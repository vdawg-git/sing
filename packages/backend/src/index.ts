import { EventEmitter } from "node:events"
import log from "ololog"

import { oneWayHandler } from "./lib/OneWayHandler"
import { twoWayHandlers } from "./lib/TwoWayHandler"
import { isOneWayEvent, isTwoWayEvent } from "./types/TypeGuards"

import type { ITwoWayResponse, IBackendEmitToFrontend } from "@sing-types/Types"

import type { IHandlerEmitter } from "@/types/Types"

log("Database path provided to backend:", process.argv[2])

// Handle incoming requests
process.on("message", handleTwoWayEvent)
process.on("message", handleOneWayEvent)
process.on("error", log.red)

// Receives data and notifications from the tasks, and then sends them to the main process
const handleReturnEmitter = new EventEmitter() as IHandlerEmitter
handleReturnEmitter.on("sendToMain", sendToMain)

// Handle incoming queries and responses
async function handleTwoWayEvent(request: unknown) {
  if (!isTwoWayEvent(request)) return

  const data = await twoWayHandlers[request.event](request.arguments_)

  // Send back to the main process, which awaits the response with this `id`
  // Thus the response should not be forwarded / emited directly to the renderer process
  sendToMain({ id: request.id, data, emitToRenderer: false })
}

// Handle incoming request which do not need a synchronous two-way response
async function handleOneWayEvent(request: unknown) {
  if (!isOneWayEvent(request)) return

  // Responses get send over via `handleReturnEmitter`
  oneWayHandler[request.event](handleReturnEmitter, ...request.arguments_)
}

function sendToMain(response: ITwoWayResponse | IBackendEmitToFrontend) {
  if (!process.send) {
    log.red(
      `process.send does not seem to be available. It is:\n`,
      process.send
    )
    return
  }

  process.send(response)
}
