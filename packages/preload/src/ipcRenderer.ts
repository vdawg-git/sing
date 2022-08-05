import { ipcRenderer } from "./TypedIPC"

import type { IMainQueryHandlers } from "./types/Types"

import type {
  IUserSettings,
  IUserSettingsKey,
} from "@sing-main/lib/UserSettings"

import type {
  IFrontendEventsConsume,
  IFrontendEventsSend,
} from "@sing-types/Types"

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

/**
 *
 * @param channel - channel to listen to
 * @param listener - the listener to call when the event is emitted
 * @returns The unsubscribe function
 */
export function listen<Key extends keyof IFrontendEventsConsume>(
  channel: Key,
  listener: IFrontendEventsConsume[Key]
) {
  ipcRenderer.on(channel, listener)

  return () => ipcRenderer.removeListener(channel, listener)
}

export function resetMusic(): void {
  ipcRenderer.send("resetMusic")
}

export function getListeners(event: keyof IFrontendEventsSend) {
  ipcRenderer.listeners(event)
}
