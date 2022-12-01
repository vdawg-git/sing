import log from "ololog"


import { coversDirectory } from "../../main/src/Consts"
import userSettingsStore from "../../main/src/lib/UserSettings"

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

export const mainEventHandlers = {
  setUserSettings: async <Key extends IUserSettingsKey>(
    _event: IpcMainInvokeEvent,
    { setting, value }: { setting: Key; value: IUserSettings[Key] }
  ) => {
    userSettingsStore.set(setting, value)
  },

  syncFolders: async () => {
    const musicDirectories = userSettingsStore.get("musicFolders") ?? []
    if (!musicDirectories?.length) {
      log.red("No music folders to add")
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
} as const
