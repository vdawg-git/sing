import { isBackendMessageToForward } from "../../backend/src/types/TypeGuards"
import { backendProcess } from "./BackendProcess"
import mainEventHandlers from "./MainEventHandlers"
import mainQueryHandlers from "./MainQueryHandlers"
import { ipcMain, webContents } from "./TypedIPC"

export default function ipcInit(): void {
  for (const [event, callback] of Object.entries(mainEventHandlers)) {
    // @ts-ignore IPC got typed, even if Typescript does not like it
    ipcMain.on(event, callback)
  }

  for (const [event, callback] of Object.entries(mainQueryHandlers)) {
    // @ts-ignore IPC got typed, even if Typescript does not like it
    ipcMain.handle(event, callback)
  }

  // Forwards to the renderer if the message is meant to be forwarded
  backendProcess.on("message", (message) => {
    if (!isBackendMessageToForward(message)) return

    for (const webContent of webContents.getAllWebContents()) {
      webContent.send(message.event, message.data)
    }
  })
}
