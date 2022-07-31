import { EventEmitter } from "node:events"
import log from "ololog"

import { oneWayHandler } from "./lib/OneWayHandler"
import { twoWayHandler } from "./lib/TwoWayHandler"
import { isOneWayEvent, isTwoWayEvent } from "./types/TypeGuards"

import type { ITwoWayResponse, IBackendEmitToFrontend } from "@sing-types/Types"

import type { IHandlerEmitter } from "@/types/Types"

log("Database path provided to backend:", process.argv[2])

// Handle incoming requests
process.on("message", handleTwoWayEvent)
process.on("message", handleOneWayEvent)
process.on("error", log.red)

// Receives return data and notifications, and then sends them to the main process

const handleReturnEmitter = new EventEmitter() as IHandlerEmitter
handleReturnEmitter.on("sendToMain", sendToMain)

// Handle incoming requests
async function handleTwoWayEvent(request: unknown) {
  if (!isTwoWayEvent(request)) return

  log.blue("twoWayEvent request:", request)

  // Typescript cant know that this code works, but it does work
  const data = await twoWayHandler[request.event](request.arguments_)

  sendToMain({ id: request.id, data })
}

async function handleOneWayEvent(request: unknown) {
  if (!isOneWayEvent(request)) return

  log.cyan("oneWayEvent request:", request)

  // Response gets send over the `handleReturnEmitter`
  oneWayHandler[request.event](handleReturnEmitter, ...request.arguments_)
}

function sendToMain(response: ITwoWayResponse | IBackendEmitToFrontend) {
  if (!process.send) {
    log.red(`process.send does not seem to be available. It is:`, process.send)
    return
  }

  process.send(response)
}
