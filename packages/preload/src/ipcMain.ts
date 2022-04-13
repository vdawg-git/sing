import type { Track } from "@prisma/client"
import { IpcMainInvokeEvent, ipcMain } from "electron"
import { app, dialog } from "electron"
// @ts-expect-error
import * as slash from "slash"
import { Tracks } from "../../main/src/lib/Crud"
import syncDirectories from "../../main/src/lib/Sync"
import userSettingsStore, {
  IUserSettings,
  IUserSettingsKey,
} from "../../main/src/lib/UserSettings"
import * as consts from "./Channels"

export default function ipcInit(): void {
  ipcMain.handle(consts.GET_TRACKS, async (_event): Promise<Track[]> => {
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

  ipcMain.on(consts.TEST, (event, args: String[]) => {
    console.log("TEST", args)
    const testTracks = args.map((track, index) => {
      return {
        cover:
          "file://C:UsersCHRISAppDataRoamingdroolcovers/2b468dbe7076ab7110b2b8bb1e95b0d2.jpeg",
        id: index,
        title: track,
        artist: `artist ${track}`,
        album: `album ${track}`,
        duration: 1000,
      }
    })

    event.sender.send("ttest", testTracks)
  })
}
