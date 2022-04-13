import { contextBridge } from "electron"
import * as ipc from "./ipcRenderer"

// import all functions to be exposed as an object and then expose that object
contextBridge.exposeInMainWorld("api", ipc)
