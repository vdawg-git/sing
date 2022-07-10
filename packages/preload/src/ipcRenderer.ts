import { ipcRenderer } from "electron"
import type {
  IUserSettings,
  IUserSettingsKey,
} from "@sing-main/lib/UserSettings"
import channels from "./Channels"
import type { ITrack, IElectronPaths } from "@sing-types/Types"
// import type { syncDirs } from "@sing-main/lib/Sync"

export async function getTracks(): Promise<readonly ITrack[]> {
  return await ipcRenderer.invoke(channels.GET_TRACKS)
}

export async function sync() {
  ipcRenderer.send(channels.SYNC)
}

export async function setUserSettings<Key extends IUserSettingsKey>(
  setting: Key,
  value: IUserSettings[Key]
) {
  return ipcRenderer.invoke(channels.SET_USER_SETTINGS, setting, value)
}

export async function openDirectory(options: Electron.OpenDialogOptions = {}) {
  return await ipcRenderer.invoke(channels.OPEN_DIR, options)
}
export async function openMusicFolder(): Promise<Electron.OpenDialogReturnValue> {
  return await ipcRenderer.invoke(channels.OPEN_MUSIC_FOLDER)
}

export async function getPath(name: IElectronPaths) {
  return await ipcRenderer.invoke(channels.GET_PATH, name)
}

export async function getUserSetting(setting: IUserSettingsKey) {
  return await ipcRenderer.invoke(channels.GET_USER_SETTINGS, setting)
}

export function listen(
  channel: typeof channels.listener[number],
  callback: (args: any) => any
) {
  if (!channels.listener.includes(channel))
    throw new Error(`Invalid channel to listen to: ${channel}`)

  ipcRenderer.on(channel, (_event, args) => callback(args))
}

export function removeListener(
  channel: typeof channels.listener[number],
  callback: (args: any) => any
) {
  if (!channels.listener.includes(channel))
    throw new Error(`Invalid channel to listen to: ${channel}`)

  ipcRenderer.removeListener(channel, callback)
}

export function send(
  channel: typeof channels.listener[number],
  message: string
) {
  ipcRenderer.send(channel, message)
}

export function resetMusic(): void {
  ipcRenderer.invoke(channels.RESET_MUSIC)
}
