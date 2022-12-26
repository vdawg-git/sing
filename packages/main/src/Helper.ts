import fs from "node:fs"
import path from "node:path"

import c from "ansicolor"
import hexoid from "hexoid"
import { app } from "electron"

import { isBackendQueryResponse } from "@sing-types/TypeGuards"

import { webContents } from "./TypedIPC"
import { databasePath, latestMigration, databaseURL } from "./Constants"
import { runPrismaCommand, prisma } from "./Prisma"

import type { ParametersWithoutFirst } from "@sing-types/Utilities"
import type { IMigration, TypedWebContents } from "./types/Types"
import type {
  IQueryChannels,
  IQueryHandlers,
  IBackendEmitChannels,
  IBackendEventHandlers,
  IBackendQuery,
} from "../../../types/IPC"
import type { ChildProcess } from "node:child_process"

/**
 *
 * @param childProcess - The child process to send queries to and receive responses from.
 * @returns The response from the`childProcess` as a promise.
 */
export function createBackendEnquirer(childProcess: ChildProcess) {
  const createUID = hexoid()

  return queryBackend

  /**
   *
   * @param timeout How many `ms` to wait for the event. If `-1` wait forever. Default is `10_000`.
   * @returns A promise resolving with the data of the awaited query.
   */
  function queryBackend<T extends IQueryChannels>(
    query: Omit<IBackendQuery<T>, "queryID">,
    timeout = 10_000
  ): ReturnType<IQueryHandlers[T]> {
    const queryID = createUID()

    const queryResponse = new Promise((resolve, reject) => {
      // Send the query to the backend with an unqiue ID
      childProcess.send({ ...query, queryID })

      // Await the corresponding answer from the backend
      childProcess.on("message", handleResponse)

      // Reject the promise after the timeout has passed
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
    return queryResponse as ReturnType<IQueryHandlers[T]>
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
    readonly arguments_: ParametersWithoutFirst<IBackendEventHandlers[Event]>
  }) {
    childProcess.send({ event, arguments_ })
  }
}

export function logProcessOutput(
  childProcess: ChildProcess,
  processName: string
) {
  childProcess.stderr?.on("data", (data) =>
    console.log(c.bgBlack.red(`Error from ${processName}-process:`), data)
  )
  childProcess.stdout?.on("data", (data) =>
    console.log(c.blue(`stdout from ${processName}-process:`), data)
  )
}

export async function sendToRenderer(
  ...[channel, ...arguments_]: Parameters<TypedWebContents["send"]>
) {
  for (const webContent of webContents.getAllWebContents()) {
    webContent.send(channel, ...arguments_)
  }
}

export async function checkDatabase() {
  let needsMigration
  const databaseExists = fs.existsSync(databasePath)
  if (databaseExists) {
    try {
      console.log(
        "Checking if migration is nessecary by running command against prisma. If it errors or is outdated, it needs a migration."
      )
      const latest: IMigration[] =
        await prisma.$queryRaw`select * from _prisma_migrations order by finished_at`
      needsMigration =
        latest[latest.length - 1]?.migration_name !== latestMigration
    } catch (error) {
      console.error(error)
      needsMigration = true
    }
  } else {
    needsMigration = true
    // prisma for whatever reason has trouble if the database file does not exist yet.
    // So just touch it here
    fs.closeSync(fs.openSync(databasePath, "w"))
  }

  if (needsMigration) {
    try {
      const schemaPath = path.join(
        app.getAppPath().replace("app.asar", "app.asar.unpacked"),
        "prisma",
        "schema.prisma"
      )
      console.log(
        `Needs a migration. Running prisma migrate with schema path ${schemaPath}`
      )

      // first create or migrate the database! If you were deploying prisma to a cloud service, this migrate deploy
      // command you would run as part of your CI/CD deployment. Since this is an electron app, it just needs
      // to run every time the production app is started. That way if the user updates the app and the schema has
      // changed, it will transparently migrate their DB.
      await runPrismaCommand({
        command: ["migrate", "deploy", "--schema", schemaPath],
        urlToDatabase: databaseURL,
      })
      console.log("Migration done.")
    } catch (error) {
      console.error(error)
      throw new Error(`${error}`)
    }
  } else {
    console.log("Does not need migration")
  }
}
