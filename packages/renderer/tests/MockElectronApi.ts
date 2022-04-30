import type * as IipcRenderer from "@sing-preload/ipcRenderer"
import type { ITrack } from "@sing-types/Track"

import type {
  IUserSettings,
  IUserSettingsKey,
} from "@sing-main/lib/UserSettings"
import * as consts from "@sing-preload/Channels"
import tracksData from "./MockTracksData"
import { vi } from "vitest"

function createMockedElectronAPI(): typeof IipcRenderer {
  return {
    getTracks: vi.fn(() => getTracks()),
    sync,
    setUserSettings,
    openDirectory,
    openMusicFolder,
    getPath,
    getUserSetting,
    listen,
    removeListener,
    send,
  }
}

export default createMockedElectronAPI()

async function getTracks(): Promise<ITrack[]> {
  return tracksData
}

async function sync() {
  return
}

async function setUserSettings<Key extends IUserSettingsKey>(
  setting: Key,
  value: IUserSettings[Key]
) {
  return
}

async function openDirectory(options: Electron.OpenDialogOptions = {}) {
  return "F:/test/test"
}
async function openMusicFolder() {
  return "F:/test/music"
}

async function getPath(name: string) {
  throw new Error("not implemented")
  return
}

async function getUserSetting(setting: IUserSettingsKey) {
  switch (setting) {
    case "musicFolders":
      return ["F:/invoked/getUserSetting/with/musicFolders", "D:/test/Test"]
    case "lightTheme":
      return false

    default:
      throw new Error(
        "could not find requested userSetting in mocked getUserSetting"
      )
  }
}

function listen(
  channel: typeof consts.listener[number],
  callback: (args: any) => any
) {
  if (!consts.listener.includes(channel))
    throw new Error(`Invalid channel to listen to: ${channel}`)

  return
}

function removeListener(
  channel: typeof consts.listener[number],
  callback: (args: any) => any
) {
  if (!consts.listener.includes(channel))
    throw new Error(`Invalid channel to listen to: ${channel}`)

  return
}

function send(channel: typeof consts.listener[number], message: string) {
  return
}
