import type { Track } from "@prisma/client"
import { IpcMainInvokeEvent, ipcMain } from "electron"
import { app, dialog } from "electron"
import slash from "slash"
import type { ITrack } from "@sing-types/Track"
import { Tracks } from "../../main/src/lib/Crud"
import syncDirectories from "../../main/src/lib/Sync"
import userSettingsStore, {
  IUserSettings,
  IUserSettingsKey,
} from "../../main/src/lib/UserSettings"
import * as consts from "./Channels"

export default function ipcInit(): void {
  ipcMain.handle(consts.GET_TRACKS, async (_event): Promise<ITrack[]> => {
    return await Tracks.get({
      select: {
        id: true,
        album: true,
        artist: true,
        duration: true,
        filepath: true,
        title: true,
        coverPath: true,
      },
    })
  })

  ipcMain.handle(
    consts.SET_USER_SETTINGS,
    async <Key extends IUserSettingsKey>(
      _event: IpcMainInvokeEvent,
      setting: Key,
      value: IUserSettings[Key]
    ): Promise<boolean> => {
      userSettingsStore.set(setting, value)
      return true
    }
  )

  ipcMain.handle(consts.SYNC, async (event) => {
    const { added, failed } = await syncDirectories()

    // Emit library track update for the frontend
    event.sender.send(consts.ON_TRACKS_UPDATED, added)
  })

  ipcMain.handle(
    consts.OPEN_DIR,
    async (_, options: Electron.OpenDialogOptions = {}) => {
      let { filePaths, canceled } = await dialog.showOpenDialog(options)

      filePaths = filePaths.map((filePath) => slash(filePath)) // Convert to UNIX path

      return { filePaths, canceled }
    }
  )

  ipcMain.handle(consts.GET_PATH, async (_event, name) => {
    return slash(app.getPath(name))
  })

  ipcMain.handle(consts.OPEN_MUSIC_FOLDER, async (_event) => {
    let { filePaths, canceled } = await dialog.showOpenDialog({
      title: "Pick folder",
      defaultPath: app.getPath("music"),
      properties: ["openDirectory", "dontAddToRecent", "multiSelections"],
    })

    filePaths = filePaths.map((filePath) => slash(filePath)) // Convert to UNIX path

    return { filePaths, canceled }
  })

  ipcMain.handle(
    consts.GET_USER_SETTINGS,
    async (_event: IpcMainInvokeEvent, setting: IUserSettingsKey) =>
      userSettingsStore.get(setting)
  )
}
