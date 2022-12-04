import os from "node:os"

import { app, BrowserWindow, dialog } from "electron"
import slash from "slash"
import { match } from "ts-pattern"
import log from "ololog"

import { coversDirectory, electronPaths } from "../../main/src/Consts"
import userSettingsStore from "../../main/src/lib/UserSettings"

import { queryBackend } from "./BackendProcess"

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
  IMusicIDsUnion,
  IPlaylistCreateArgument,
  IPlaylistEditDescriptionArgument,
  IPlaylistFindManyArgument,
  IPlaylistGetArgument,
  IPlaylistRenameArgument,
  IPlaylistUpdateCoverArgumentSend,
  ITrackFindManyArgument,
} from "@sing-types/DatabaseTypes"
import type { IElectronPaths, IError } from "@sing-types/Types"
import type { Prisma } from "@prisma/client"
import type {
  IpcMainInvokeEvent,
  OpenDialogReturnValue,
  OpenDialogOptions,
} from "electron"
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

  getTracksFromMusic: async (_: IpcMainInvokeEvent, options: IMusicIDsUnion) =>
    queryBackend({
      query: "getTracksFromMusic",
      arguments_: options,
    }),

  /**
   *
   * @param defaultPath Can get one of Electrons default paths or a custom one.
   * @returns
   */
  openDirectoryPicker: async (
    _: IpcMainInvokeEvent,
    options: Electron.OpenDialogOptions = {}
  ): Promise<OpenDialogReturnValue & { filePaths: DirectoryPath[] }> => {
    const defaultPath = options.defaultPath
      ? electronPaths.includes(options.defaultPath as IElectronPaths)
        ? app.getPath(options.defaultPath as IElectronPaths)
        : options.defaultPath
      : undefined

    const dialogOptions: OpenDialogOptions = {
      ...options,
      ...(defaultPath && { defaultPath }),
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
  ): Promise<
    | { filePath: FilePath; canceled: false }
    | { filePath: undefined; canceled: true }
  > => {
    const dialogOptions: Electron.OpenDialogOptions = {
      ...options,
      properties: ["openFile"],
      filters: [{ extensions: ["png", "webp", "jpg", "gif"], name: "Images" }],
      defaultPath: app.getPath("pictures"),
    }

    const { filePaths, canceled } = await dialog.showOpenDialog(dialogOptions)

    return match(canceled)
      .with(true, () => ({ filePath: undefined, canceled: true } as const))
      .with(
        false,
        () =>
          ({
            filePath: slash(filePaths[0]) as FilePath,
            canceled: false,
          } as const)
      )
      .exhaustive()
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

  updatePlaylistCover: async (
    _: IpcMainInvokeEvent,
    options: IPlaylistUpdateCoverArgumentSend
  ) =>
    queryBackend({
      query: "updatePlaylistImage",
      arguments_: { ...options, coversDirectory },
    }),

  isMacOS: async () => os.platform() === "darwin",

  /**
   * @returns If fullscreen is set.
   */
  toggleFullscreen: async (event: IpcMainInvokeEvent): Promise<boolean> => {
    const window = BrowserWindow.fromWebContents(event.sender)

    if (window === null) {
      log.error.red(
        "Invalid minimize event received. The window could not be found."
      )

      return false
    }

    window.isMaximized() ? window.unmaximize() : window.maximize()

    return window.isMaximized()
  },
})
