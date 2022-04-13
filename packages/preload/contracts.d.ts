import * as ipc from "./src/ipcRenderer"

declare global {
  interface Window {
    api: typeof ipc
  }
}
