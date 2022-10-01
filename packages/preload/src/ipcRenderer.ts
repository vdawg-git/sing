import { ipcRenderer } from "./TypedIPC"

import type {
  IAlbumFindManyArgument,
  IAlbumGetArgument,
  IArtistFindManyArgument,
  IArtistGetArgument,
  ITrackFindManyArgument,
} from "@sing-types/Types"

import type { IMainQueryHandlers } from "./types/Types"

import type {
  IUserSettings,
  IUserSettingsKey,
} from "@sing-main/lib/UserSettings"

import type {
  IFrontendEventsConsume,
  IFrontendEventsSend,
} from "@sing-types/IPC"

import type { Prisma } from "@prisma/client"

/**
 * The default sort is ["title", "ascending"] and gets used if it is not specified.
 * The default for isShuffleOn is false and gets used if it is not specified.
 */
export async function getTracks(options?: ITrackFindManyArgument) {
  return ipcRenderer.invoke("getTracks", options)
}

export async function getAlbums(options?: IAlbumFindManyArgument) {
  return ipcRenderer.invoke("getAlbums", options)
}

export async function getAlbum(options: IAlbumGetArgument) {
  return ipcRenderer.invoke("getAlbum", options)
}

export async function getArtists(options?: IArtistFindManyArgument) {
  return ipcRenderer.invoke("getArtists", options)
}

export async function getArtist(options: IArtistGetArgument) {
  return ipcRenderer.invoke("getArtist", options)
}

export async function getCovers(options?: Prisma.CoverFindManyArgs) {
  return ipcRenderer.invoke("getCovers", options)
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

  // Return the unsubscribe function, because unsubscribing doesn't work otherwise
  return () => ipcRenderer.removeListener(channel, listener)
}

export function resetMusic(): void {
  ipcRenderer.send("resetMusic")
}

export function getListeners(event: keyof IFrontendEventsSend) {
  ipcRenderer.listeners(event)
}

export async function search(query: string) {
  return ipcRenderer.invoke("search", query)
}
