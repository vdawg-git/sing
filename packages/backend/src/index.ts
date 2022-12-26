import { match } from "ts-pattern"
import sourceMaps from "source-map-support"

import { backendEventHandlers } from "@/lib/EventHandlers"
import { queryHandlers } from "@/lib/QueryHandlers"
import { isBackendEvent, isBackendQuery } from "@/types/TypeGuards"

import { backendMessages } from "./lib/Messages"
import { updatePlaylistCoverAfterTracksUpdate } from "./lib/Crud"
import { updateSearchList } from "./lib/Search"

import type {
  IBackendQueryResponse,
  IBackendEmitToFrontend,
  IBackendQuery,
  IBackendEvent,
} from "@sing-types/IPC"

sourceMaps.install()

// log.dim("Databasepath provided to backend:", process.argv[2])

// Handle incoming requests
process.on("message", handleMessageFromMain)
process.on("error", console.error)

// Handle internal events
backendMessages.on("*", (_, message) => {
  match(message)
    .with({ shouldForwardToRenderer: true }, sendToMain)
    .with({ event: "playlistUpdatedInternal" }, (data) =>
      sendToMain({
        ...data,
        event: "playlistUpdated",
        shouldForwardToRenderer: true,
      })
    )
    .otherwise((data) =>
      console.error("Backend Index: Unhandled message received:", data)
    )
})

backendMessages.on("playlistUpdatedInternal", (id) =>
  updatePlaylistCoverAfterTracksUpdate(backendMessages, id)
)
backendMessages.on("syncedMusic", updateSearchList)

function handleMessageFromMain(request: unknown): void {
  if (isBackendQuery(request)) {
    handleQuery(request)
    return
  }

  if (isBackendEvent(request)) {
    handleEvent(request)
    return
  }

  console.error("Received unprocessed / unsupported request:", request)
}

// Handle incoming queries and responses
async function handleQuery({
  queryID,
  query,
  arguments_,
}: IBackendQuery): Promise<void> {
  // @ts-expect-error
  const data = await queryHandlers[query](backendMessages, arguments_)

  // Send back to the main process, which awaits the response with this `id`
  // Thus the response should not be forwarded / emited directly to the renderer process
  // @ts-expect-error
  sendToMain({ queryID, data, shouldForwardToRenderer: false })
}

// Handle incoming request which do not need a synchronous two-way response
function handleEvent({ event, arguments_ }: IBackendEvent): void {
  // Responses are send to main via the `handleReturnEmitter`
  // @ts-expect-error
  backendEventHandlers[event](backendMessages, ...arguments_)
}

function sendToMain(response: IBackendQueryResponse | IBackendEmitToFrontend) {
  if (!process.send) {
    console.error(
      `process.send does not seem to be available. It is:\n`,
      process.send
    )

    return
  }
  // log.cyan.maxArrayLength(3).maxObjectLength(5)("Event from backend:", response)

  process.send(response)
}
