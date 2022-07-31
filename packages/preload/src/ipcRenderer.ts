import { ipcRenderer } from "./TypedIPC"

import type { IMainQueryHandlers } from "./types/Types"

import type {
  IUserSettings,
  IUserSettingsKey,
} from "@sing-main/lib/UserSettings"

import type { IFrontendEventsConsume } from "@sing-types/Types"

import type { ParametersFlattened } from "@sing-types/Utilities"

export async function getTracks(
  options?: ParametersFlattened<IMainQueryHandlers["getTracks"]>
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

export function listen<Key extends keyof IFrontendEventsConsume>(
  channel: Key,
  listener: IFrontendEventsConsume[Key]
) {
  ipcRenderer.on(channel, listener)
}

export function removeListener<Key extends keyof IFrontendEventsConsume>(
  channel: Key,
  listener: IFrontendEventsConsume[Key]
) {
  ipcRenderer.removeListener(channel, listener)
}

// Should only be used for manual testing purposes
export const { send } = ipcRenderer

export function resetMusic(): void {
  ipcRenderer.send("resetMusic")
}
