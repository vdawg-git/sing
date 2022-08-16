import { app, dialog } from "electron"
import hexoid from "hexoid"
import slash from "slash"

import userSettingsStore from "../../main/src/lib/UserSettings"
import { queryBackend } from "./BackendProcess"

import type { IpcMainInvokeEvent, OpenDialogReturnValue } from "electron"
import type { IElectronPaths } from "@sing-types/Types"
import type {
  IUserSettings,
  IUserSettingsKey,
} from "@sing-main/lib/UserSettings"
import type { Prisma } from "@prisma/client"
import type { DirectoryPath } from "@sing-types/Filesystem"

const createUID = hexoid()

const mainQueryHandlers = {
  getTracks: async (
    _: IpcMainInvokeEvent,
    options: Prisma.TrackFindManyArgs | undefined
  ) =>
    queryBackend({
      event: "getTracks",
      args: [options],
      id: createUID(),
    }),
  getAlbums: async (
    _: IpcMainInvokeEvent,
    options: Prisma.AlbumFindManyArgs | undefined
  ) =>
    queryBackend({
      event: "getAlbums",
      args: [options],
      id: createUID(),
    }),
  getArtists: async (
    _: IpcMainInvokeEvent,
    options: Prisma.ArtistFindManyArgs | undefined
  ) =>
    queryBackend({
      event: "getArtists",
      args: [options],
      id: createUID(),
    }),
  getCovers: async (
    _: IpcMainInvokeEvent,
    options: Prisma.CoverFindManyArgs | undefined
  ) =>
    queryBackend({
      event: "getCovers",
      args: [options],
      id: createUID(),
    }),

  openDirectoryPicker: async (
    _: IpcMainInvokeEvent,
    options: Electron.OpenDialogOptions = {},
    defaultPath: IElectronPaths = "music"
  ): Promise<OpenDialogReturnValue & { filePaths: DirectoryPath[] }> => {
    const dialogOptions = {
      ...options,
      ...(defaultPath && { defaultPath: app.getPath(defaultPath) }),
    }

    const { filePaths, canceled } = await dialog.showOpenDialog(dialogOptions)

    const unixedPaths = filePaths.map((filePath) =>
      slash(filePath)
    ) as DirectoryPath[] // Convert to UNIX path

    return { filePaths: unixedPaths, canceled }
  },

  getUserSettings: async <Key extends IUserSettingsKey>(
    _: IpcMainInvokeEvent,
    setting: Key
  ): Promise<IUserSettings[Key]> => userSettingsStore.get(setting),
}

export default mainQueryHandlers
