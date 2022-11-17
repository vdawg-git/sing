import { app, dialog } from "electron"
import slash from "slash"

import type {
  IUserSettings,
  IUserSettingsKey,
} from "@sing-main/lib/UserSettings"
import type { DirectoryPath, FilePath } from "@sing-types/Filesystem"
import type {
  IAlbum,
  IAlbumFindManyArgument,
  IAlbumGetArgument,
  IArtist,
  IArtistFindManyArgument,
  IPlaylistCreateArgument,
  IPlaylistEditDescriptionArgument,
  IPlaylistFindManyArgument,
  IPlaylistGetArgument,
  IPlaylistRenameArgument,
  ITrackFindManyArgument,
} from "@sing-types/DatabaseTypes"
import type { IElectronPaths, IError } from "@sing-types/Types"

import userSettingsStore from "../../main/src/lib/UserSettings"

import { queryBackend } from "./BackendProcess"

import type { Prisma } from "@prisma/client"
import type { IpcMainInvokeEvent, OpenDialogReturnValue } from "electron"
import type { Either } from "fp-ts/lib/Either"

/**
 * Query the backend or the main-electron process for data.
 *
 * When querying the backend the function can be found in `queryHandlers.ts`.
 */
export const mainQueryHandlers = Object.freeze({
  getPlaylists: async (
    _: IpcMainInvokeEvent,
    options: IPlaylistFindManyArgument | undefined
  ) => queryBackend({ query: "getPlaylists", arguments_: options }),

  getPlaylist: async (_: IpcMainInvokeEvent, options: IPlaylistGetArgument) =>
    queryBackend({ query: "getPlaylist", arguments_: options }),

  createPlaylist: async (
    _: IpcMainInvokeEvent,
    options?: IPlaylistCreateArgument
  ) => queryBackend({ query: "createPlaylist", arguments_: options }),

  deletePlaylist: async (_: IpcMainInvokeEvent, id: number) =>
    queryBackend({ query: "deletePlaylist", arguments_: id }),

  renamePlaylist: async (
    _: IpcMainInvokeEvent,
    options: IPlaylistRenameArgument
  ) => queryBackend({ query: "renamePlaylist", arguments_: options }),

  editPlaylistDescription: async (
    _: IpcMainInvokeEvent,
    options: IPlaylistEditDescriptionArgument
  ) => queryBackend({ query: "editPlaylistDescription", arguments_: options }),

  getTracks: async (
    _: IpcMainInvokeEvent,
    options: ITrackFindManyArgument | undefined
  ) =>
    queryBackend({
      query: "getTracks",
      arguments_: options,
    }),

  getAlbums: async (
    _: IpcMainInvokeEvent,
    options: IAlbumFindManyArgument | undefined
  ) =>
    queryBackend({
      query: "getAlbums",
      arguments_: options,
    }),

  getAlbum: async (
    _: IpcMainInvokeEvent,
    options: IAlbumGetArgument
  ): Promise<Either<IError, IAlbum>> =>
    queryBackend({
      query: "getAlbum",
      arguments_: options,
    }),

  getArtists: async (
    _: IpcMainInvokeEvent,
    options: IArtistFindManyArgument | undefined
  ) =>
    queryBackend({
      query: "getArtists",
      arguments_: options,
    }),

  getArtist: async (
    _: IpcMainInvokeEvent,
    options: IAlbumGetArgument
  ): Promise<Either<IError, IArtist>> =>
    queryBackend({
      query: "getArtist",
      arguments_: options,
    }),

  getCovers: async (
    _: IpcMainInvokeEvent,
    options: Prisma.CoverFindManyArgs | undefined
  ) =>
    queryBackend({
      query: "getCovers",
      arguments_: options,
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

  openImagePicker: async (
    _: IpcMainInvokeEvent,
    options: Required<Pick<Electron.OpenDialogOptions, "message" | "title">> &
      Pick<Electron.OpenDialogOptions, "buttonLabel">
  ): Promise<{ filePath: FilePath; canceled: boolean }> => {
    const dialogOptions: Electron.OpenDialogOptions = {
      ...options,
      properties: ["openFile"],
      filters: [{ extensions: ["png", "webp", "jpg", "gif"], name: "Images" }],
      defaultPath: app.getPath("pictures"),
    }

    const { filePaths, canceled } = await dialog.showOpenDialog(dialogOptions)

    const unixedPath = slash(filePaths[0]) as FilePath // Convert to UNIX path

    return { filePath: unixedPath, canceled }
  },

  getUserSettings: async <Key extends IUserSettingsKey>(
    _: IpcMainInvokeEvent,
    setting: Key
  ): Promise<IUserSettings[Key]> => userSettingsStore.get(setting),

  search: async (_: IpcMainInvokeEvent, query: string) =>
    queryBackend({
      query: "search",
      arguments_: query,
    }),
})
