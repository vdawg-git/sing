import { ipcRenderer } from "./TypedIPC"

import type { IMainEventHandlers, IMainQueryHandlers } from "./types/Types"

import type {
  IUserSettings,
  IUserSettingsKey,
} from "@sing-main/lib/UserSettings"
import type {
  FlattenedParameters,
  IFrontendEventsBase,
} from "@sing-types/Types"

export async function getTracks(
  options?: FlattenedParameters<IMainQueryHandlers["getTracks"]>
) {
  return ipcRenderer.invoke("getTracks", options)
}

export async function sync() {
  ipcRenderer.send("syncFolders")
}

export async function setUserSettings<Key extends IUserSettingsKey>(
  setting: Key,
  value: IUserSettings[Key]
) {
  return ipcRenderer.send("setUserSettings", setting, value)
}

export async function openDirectory(
  ...arguments_: Parameters<IMainQueryHandlers["openDirectoryPicker"]>
) {
  return ipcRenderer.invoke("openDirectoryPicker", arguments_[0], arguments_[1])
}

export async function getUserSetting(setting: IUserSettingsKey) {
  return ipcRenderer.invoke("getUserSettings", setting)
}

export function listen<Key extends keyof IFrontendEventsBase>(
  channel: Key,
  callback: IFrontendEventsBase[Key]
) {
  ipcRenderer.on(channel, callback)
}

export function removeListener<Key extends keyof IFrontendEventsBase>(
  channel: Key,
  callback: IFrontendEventsBase[Key]
) {
  ipcRenderer.removeListener(channel, callback)
}

export function send<Key extends keyof IMainEventHandlers>(
  channel: Key,
  ...message: Parameters<IMainEventHandlers[Key]>
) {
  ipcRenderer.send(channel, ...message)
}

export function resetMusic(): void {
  ipcRenderer.send("resetMusic")
}
