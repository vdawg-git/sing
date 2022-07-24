import { ipcMain as untypedMain, ipcRenderer as untypedRenderer, webContents as untypedWebContents } from "electron"

import type {
  TypedIpcMain,
  TypedIpcRenderer,
  TypedWebContents,
} from "./types/Types"

export const ipcMain = untypedMain as TypedIpcMain
export const ipcRenderer = untypedRenderer as TypedIpcRenderer
export const webContents = untypedWebContents as unknown as TypedWebContents
