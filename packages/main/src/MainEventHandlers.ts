import { app, BrowserWindow } from "electron"

import { coversDirectory } from "./Constants"
import userSettingsStore from "./lib/UserSettings"
import { emitToBackend } from "./BackendProcess"

import type {
  IRemoveTracksFromPlaylistArgument,
  IAddTracksToPlaylistArgument,
} from "@sing-types/DatabaseTypes"
import type { DirectoryPath } from "@sing-types/Filesystem"
import type { IpcMainInvokeEvent } from "electron"
import type {
  IUserSettings,
  IUserSettingsKey,
} from "../../main/src/lib/UserSettings"

export const mainEventHandlers = Object.freeze({
  setUserSettings: async <Key extends IUserSettingsKey>(
    _event: IpcMainInvokeEvent,
    { setting, value }: { setting: Key; value: IUserSettings[Key] }
  ) => {
    userSettingsStore.set(setting, value)
  },

  syncFolders: async () => {
    const musicDirectories = userSettingsStore.get("musicFolders") ?? []
    if (!musicDirectories?.length) {
      console.log("No music folders to add")
    }

    emitToBackend({
      event: "syncMusic",
      arguments_: [{ coversDirectory, directories: musicDirectories }],
    })
  },

  resetMusic: async () => {
    userSettingsStore.reset("musicFolders")

    emitToBackend({
      event: "syncMusic",
      arguments_: [{ coversDirectory, directories: [""] as DirectoryPath[] }],
    })
  },

  addTracksToPlaylist: async (
    _: IpcMainInvokeEvent,
    options: IAddTracksToPlaylistArgument
  ) => {
    emitToBackend({
      event: "addTracksToPlaylist",
      arguments_: [options],
    })
  },

  removeTracksFromPlaylist: async (
    _: IpcMainInvokeEvent,
    options: IRemoveTracksFromPlaylistArgument
  ) => {
    emitToBackend({
      event: "removeTracksFromPlaylist",
      arguments_: [options],
    })
  },

  minimizeWindow: async (event: IpcMainInvokeEvent) => {
    const window = BrowserWindow.fromWebContents(event.sender)

    if (window === null) {
      console.error(
        "Invalid minimize event received. The window could not be found."
      )

      return
    }

    window.minimize()
  },

  quit: app.quit,
})
