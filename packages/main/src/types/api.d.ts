import type * as ipc from "../ipcRenderer"

declare global {
  interface Window {
    api: typeof ipc
  }
}
