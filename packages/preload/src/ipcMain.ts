import log from "ololog"

import { isBackendMessageToForward } from "../../backend/src/types/TypeGuards"
import { backendProcess } from "./BackendProcess"
import { sendToRenderer } from "./Helper"
import mainEventHandlers from "./MainEventHandlers"
import mainQueryHandlers from "./MainQueryHandlers"
import { ipcMain } from "./TypedIPC"

export default function ipcInit(): void {
  for (const [event, callback] of Object.entries(mainEventHandlers)) {
    // @ts-ignore IPC got typed, even if Typescript does not like it
    ipcMain.on(event, callback)
  }

  for (const [event, callback] of Object.entries(mainQueryHandlers)) {
    // @ts-ignore IPC got typed, even if Typescript does not like it
    ipcMain.handle(event, callback)
  }

  // If the message is meant to be forwarded to the renderer, forward it
  backendProcess.on("message", (message) => {
    if (!isBackendMessageToForward(message)) return

    // @ts-ignore IPC got typed, even if Typescript does not like it
    sendToRenderer(message.event, message.data)
  })
}
