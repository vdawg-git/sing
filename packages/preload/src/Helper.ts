import { isIDBackendAnswer } from "@sing-types/TypeGuards"
import c from "ansicolor"
import log from "ololog"

import { webContents } from "./TypedIPC"

import type { ParametersWithoutFirst } from "@sing-types/Utilities"
import type { TypedWebContents } from "./types/Types"

import type { ChildProcess } from "node:child_process"

import type {
  ITwoWayEvents,
  ITwoWayHandlers,
  IBackendEmitChannels,
  IOneWayHandlersConsume,
} from "@sing-types/Types"
/**
 *
 * @param {ChildProcess}  childProcess - The child_process instance to listen and send events to
 * @returns
 */
export function createPromisifiedForkEmitter(childProcess: ChildProcess) {
  return queryBackend

  /**
   *
   * @param obj The arguments
   * @param timeout How many `ms` to wait for the event. If `-1` wait forever. Default is `10_000`.
   * @returns A promise resolving with the data of the awaited event.
   */
  function queryBackend<T extends ITwoWayEvents>(
    {
      event,
      args,
      id,
    }: { event: T; args: ITwoWayHandlers[T]["args"]; id: string },
    timeout = 10_000
  ): Promise<ITwoWayHandlers[T]["response"]> {
    const promise = new Promise((resolve, reject) => {
      childProcess.on("message", listenerResolve)

      childProcess.send({ event, id, args })

      function listenerResolve(message: unknown) {
        // Filter out unrelated events
        if (!isIDBackendAnswer(message)) return
        // If it does not match the send ID then ignore it and continue waiting for the next event
        if (message.id !== id) return

        // Clean up itself
        childProcess.removeListener("message", listenerResolve)
        // Return data from the event
        resolve(message.data)
      }

      // Reject the promise after the timeout has passed
      if (timeout !== -1) {
        setTimeout(() => {
          childProcess.removeListener("message", listenerResolve)
          reject(new Error(`Request timed out after ${timeout}ms`))
        }, timeout)
      }
    })

    return promise as Promise<ITwoWayHandlers[T]["response"]>
  }
}

export function createBackendSender(childProcess: ChildProcess) {
  return emitToBackend

  async function emitToBackend<Event extends IBackendEmitChannels>({
    event,
    arguments_,
  }: {
    readonly event: Event
    readonly arguments_: ParametersWithoutFirst<IOneWayHandlersConsume[Event]>
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
