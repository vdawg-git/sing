import { isBackendQueryResponse } from "@sing-types/TypeGuards"
import c from "ansicolor"
import log from "ololog"

import { webContents } from "./TypedIPC"

import type { ParametersWithoutFirst } from "@sing-types/Utilities"
import type { TypedWebContents } from "./types/Types"
import type { ChildProcess } from "node:child_process"
import type {
  ITwoWayChannel,
  ITwoWayHandlers,
  IBackendEmitChannels,
  IEventHandlersConsume,
  IBackendQuery,
} from "../../../types/IPC"

/**
 *
 * @param childProcess - The child process to send queries to and receive responses from.
 * @returns The response from the`childProcess` as a promise.
 */
export function createBackendEnquirer(childProcess: ChildProcess) {
  return queryBackend

  /**
   *
   * @param obj The arguments
   * @param timeout How many `ms` to wait for the event. If `-1` wait forever. Default is `10_000`.
   * @returns A promise resolving with the data of the awaited event.
   */
  function queryBackend<T extends ITwoWayChannel>(
    {
      event,
      arguments_,
      id: queryID,
    }: Readonly<{
      event: T
      arguments_: Parameters<ITwoWayHandlers[T]>
      id: string
    }>,
    timeout = 10_000
  ): ReturnType<ITwoWayHandlers[T]> {
    const queryResponse = new Promise((resolve, reject) => {
      const query: IBackendQuery = { event, queryID, arguments_ }

      // Send the query to the backend
      childProcess.send(query)

      // Await the corresponding answer from the backend
      childProcess.on("message", handleResponse)

      // Reject the promise after the timeout has passed (if a timeout has been passed)
      if (timeout !== -1) {
        setTimeout(() => {
          childProcess.removeListener("message", handleResponse)

          reject(new Error(`Request timed out after ${timeout}ms`))
        }, timeout)
      }

      // The handler for the response
      function handleResponse(message: unknown) {
        // Filter out unrelated responses
        if (!isBackendQueryResponse(message)) return

        // If it does not match the send ID then ignore it and continue waiting for the next corresponding response
        if (message.queryID !== queryID) return

        // Clean up itself
        childProcess.removeListener("message", handleResponse)

        // Return data from the event
        resolve(message.data)
      }
    })
    return queryResponse as ReturnType<ITwoWayHandlers[T]>
  }
}

/**
 * Create a typed function which emits data to the child process. It only emits, it does not get a response. For this use {@link createBackendEnquirer}
 * @param childProcess The child process to emit data to
 * @returns A function to emit data to the child process.
 */
export function createBackendEmitter(childProcess: ChildProcess) {
  return emitToBackend

  /**
   *
   * @param param0 The data to emit to the child process.
   * @returns Nothing, it just emits.
   */
  async function emitToBackend<Event extends IBackendEmitChannels>({
    event,
    arguments_,
  }: {
    readonly event: Event
    readonly arguments_: ParametersWithoutFirst<IEventHandlersConsume[Event]>
  }) {
    childProcess.send({ event, arguments_ })
  }
}

export function logProcessOutput(
  childProcess: ChildProcess,
  processName: string
) {
  childProcess.stderr?.on("data", (data) =>
    log.red.noLocate(c.bgBlack.red(`Error from ${processName}-process:`), data)
  )
  childProcess.stdout?.on("data", (data) =>
    log.noLocate(c.blue(`stdout from ${processName}-process:`), data)
  )
}

export async function sendToRenderer(
  ...[channel, ...arguments_]: Parameters<TypedWebContents["send"]>
) {
  for (const webContent of webContents.getAllWebContents()) {
    webContent.send(channel, ...arguments_)
  }
}
