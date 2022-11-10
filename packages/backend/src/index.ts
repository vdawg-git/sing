import log from "ololog"
import mitt from "mitt"

import type {
  IBackendQueryResponse,
  IBackendEmitToFrontend,
  IBackendQuery,
  IBackendEvent,
  IBackendEmitToFrontendPayload,
} from "@sing-types/IPC"

import { backendEventHandlers } from "@/lib/EventHandlers"
import { queryHandlers } from "@/lib/QueryHandlers"
import { isBackendEvent, isBackendQuery } from "@/types/TypeGuards"

log.dim("Database path provided to backend:", process.argv[2])

// Handle incoming requests
process.on("message", handleMessage)
process.on("error", log.error.red)

// Gets passed to the handlers to forward data and notifications from the them to the main process
const asyncMessageHandler = mitt<IBackendEmitToFrontend>()

asyncMessageHandler.on("*", (type, data) =>
  // @ts-ignore
  sendToMain({ forwardToRenderer: true, event: type, data })
)

function handleMessage(request: unknown): void {
  log.blue.maxArrayLength(3).maxObjectLength(5)(request)

  if (isBackendQuery(request)) {
    handleQuery(request)
    return
  }

  if (isBackendEvent(request)) {
    handleEvent(request)
    return
  }

  log.error.red("Received unprocessed / unsupported request:", request)
}

// Handle incoming queries and responses
async function handleQuery({
  queryID,
  query,
  arguments_,
}: IBackendQuery): Promise<void> {
  // @ts-ignore
  const data = await queryHandlers[query](asyncMessageHandler, arguments_)

  // Send back to the main process, which awaits the response with this `id`
  // Thus the response should not be forwarded / emited directly to the renderer process
  // @ts-ignore
  sendToMain({ queryID, data, forwardToRenderer: false })
}

// Handle incoming request which do not need a synchronous two-way response
function handleEvent({ event, arguments_ }: IBackendEvent): void {
  // Responses are send to main via the `handleReturnEmitter`
  // @ts-ignore
  backendEventHandlers[event](asyncMessageHandler, ...arguments_)
}

function sendToMain(
  response: IBackendQueryResponse | IBackendEmitToFrontendPayload
) {
  if (!process.send) {
    log.red(
      `process.send does not seem to be available. It is:\n`,
      process.send
    )

    return
  }
  log.cyan.maxArrayLength(3).maxObjectLength(5)("Event from backend:", response)

  process.send(response)
}
