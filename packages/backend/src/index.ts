import log from "ololog"

import { oneWayHandler } from "./lib/OneWayHandler"
import { twoWayHandler } from "./lib/TwoWayHandler"
import { isOneWayEvent, isTwoWayEvent } from "./types/TypeGuards"

import type { ITwoWayResponse, IBackendMessageToForward } from "./types/Types"

log("Database path provided to backend:", process.argv[2])

// Handle incoming requests
process.on("message", handleTwoWayEvent)
process.on("message", handleOneWayEvent)

process.on("error", log)

async function handleTwoWayEvent(request: unknown) {
  if (!isTwoWayEvent(request)) {
    return
  }
  log("twoWayEvent:", request)

  // Typescript cant know that this code works, but it does
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await twoWayHandler[request.event](request.args as any)

  sendToMain({ id: request.id, data })
}

async function handleOneWayEvent(request: unknown) {
  if (!isOneWayEvent(request)) {
    return
  }
  log("oneWayEvent:", request)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toEmit = await oneWayHandler[request.event](request.args as any)

  sendToMain(toEmit)
}

function sendToMain(response: ITwoWayResponse | IBackendMessageToForward) {
  if (!process.send) {
    log.red(`process.send does not seem to be available. It is:`, process.send)
    return
  }
  process.send(response)
}
