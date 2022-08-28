import { app, dialog } from "electron"
import hexoid from "hexoid"
import slash from "slash"

import userSettingsStore from "../../main/src/lib/UserSettings"
import { queryBackend } from "./BackendProcess"

import type { Either } from "fp-ts/lib/Either"
import type { IpcMainInvokeEvent, OpenDialogReturnValue } from "electron"
import type {
  IAlbumWithTracks,
  IArtist,
  IElectronPaths,
  IError,
} from "@sing-types/Types"
import type {
  IUserSettings,
  IUserSettingsKey,
} from "@sing-main/lib/UserSettings"
import type { Prisma } from "@prisma/client"
import type { DirectoryPath } from "@sing-types/Filesystem"

const createUID = hexoid()

/**
 * Query the backend or the main-electron process for data
 */
const mainQueryHandlers = {
  getTracks: async (
    _: IpcMainInvokeEvent,
    options: Prisma.TrackFindManyArgs | undefined
  ) =>
    queryBackend({
      event: "getTracks",
      arguments_: options,
      queryID: createUID(),
    }),

  getAlbums: async (
    _: IpcMainInvokeEvent,
    options: Prisma.AlbumFindManyArgs | undefined
  ) =>
    queryBackend({
      event: "getAlbums",
      arguments_: options,
      queryID: createUID(),
    }),

  getAlbum: async (
    _: IpcMainInvokeEvent,
    options: Prisma.AlbumFindUniqueOrThrowArgs
  ): Promise<Either<IError, IAlbumWithTracks>> =>
    queryBackend({
      event: "getAlbum",
      arguments_: options,
      queryID: createUID(),
    }),

  getArtists: async (
    _: IpcMainInvokeEvent,
    options: Prisma.ArtistFindManyArgs | undefined
  ) =>
    queryBackend({
      event: "getArtists",
      arguments_: options,
      queryID: createUID(),
    }),

  getArtist: async (
    _: IpcMainInvokeEvent,
    options: Prisma.ArtistFindUniqueOrThrowArgs
  ): Promise<Either<IError, IArtist>> =>
    queryBackend({
      event: "getArtist",
      arguments_: options,
      queryID: createUID(),
    }),

  getCovers: async (
    _: IpcMainInvokeEvent,
    options: Prisma.CoverFindManyArgs | undefined
  ) =>
    queryBackend({
      event: "getCovers",
      arguments_: options,
      queryID: createUID(),
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

    const unixedPaths = filePaths.map(
      (filePath) => slash(filePath) // Convert to UNIX path
    ) as DirectoryPath[]

    return { filePaths: unixedPaths, canceled }
  },

  getUserSettings: async <Key extends IUserSettingsKey>(
    _: IpcMainInvokeEvent,
    setting: Key
  ): Promise<IUserSettings[Key]> => userSettingsStore.get(setting),
}

export default mainQueryHandlers
