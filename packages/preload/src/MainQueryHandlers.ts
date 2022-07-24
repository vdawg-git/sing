import { app, dialog } from "electron"
import hexoid from "hexoid"
import slash from "slash"

import userSettingsStore from "../../main/src/lib/UserSettings"
import { queryBackend } from "./BackendProcess"

import type { IpcMainInvokeEvent } from "electron"
import type { FlattenedParameters, IElectronPaths } from "@sing-types/Types"
import type {
  IUserSettings,
  IUserSettingsKey,
} from "@sing-main/lib/UserSettings"

const createUID = hexoid()

const mainQueryHandlers = {
  getTracks: async (
    _: IpcMainInvokeEvent,
    options: FlattenedParameters<typeof queryBackend<"getTracks">>[0]["args"]
  ) =>
    queryBackend({
      event: "getTracks",
      args: options,
      id: createUID(),
    }),

  openDirectoryPicker: async (
    _: IpcMainInvokeEvent,
    options: Electron.OpenDialogOptions = {},
    defaultPath: IElectronPaths = "music"
  ) => {
    const dialogOptions = {
      ...options,
      ...(defaultPath && { defaultPath: app.getPath(defaultPath) }),
    }

    const { filePaths, canceled } = await dialog.showOpenDialog(dialogOptions)

    const unixedPaths = filePaths.map((filePath) => slash(filePath)) // Convert to UNIX path

    return { filePaths: unixedPaths, canceled }
  },

  getUserSettings: async <Key extends IUserSettingsKey>(
    _: IpcMainInvokeEvent,
    setting: Key
  ): Promise<IUserSettings[Key]> => userSettingsStore.get(setting),
}

export default mainQueryHandlers
