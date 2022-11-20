import type {
  IUserSettings,
  IUserSettingsKey,
} from "@sing-main/lib/UserSettings"
import type {
  IFrontendEventsConsume,
  IFrontendEventsSend,
} from "@sing-types/IPC"
import type {
  IAlbumFindManyArgument,
  IAlbumGetArgument,
  IArtistFindManyArgument,
  IArtistGetArgument,
  IPlaylistCreateArgument,
  IPlaylistFindManyArgument,
  IPlaylistGetArgument,
  IPlaylistRenameArgument,
  IRemoveTracksFromPlaylistArgument,
  ITrackFindManyArgument,
  IAddTracksToPlaylistArgument,
  IPlaylistEditDescriptionArgument,
  IPlaylistUpdateCoverArgumentSend,
} from "@sing-types/DatabaseTypes"

import { ipcRenderer } from "./TypedIPC"

import type { IMainQueryHandlers } from "./types/Types"
import type { Prisma } from "@prisma/client"

export async function getPlaylists(options?: IPlaylistFindManyArgument) {
  return ipcRenderer.invoke("getPlaylists", options)
}

export async function getPlaylist(options: IPlaylistGetArgument) {
  return ipcRenderer.invoke("getPlaylist", options)
}

/**
 *  Usually we want to use the `createAndNavigateToPlaylist` function in `renderer/helper.ts` to also navigate to the newly created playlist.
 */
export async function createPlaylist(options?: IPlaylistCreateArgument) {
  return ipcRenderer.invoke("createPlaylist", options)
}

export async function renamePlaylist(options: IPlaylistRenameArgument) {
  return ipcRenderer.invoke("renamePlaylist", options)
}

export async function editPlaylistDescription(
  options: IPlaylistEditDescriptionArgument
) {
  return ipcRenderer.invoke("editPlaylistDescription", options)
}

export async function deletePlaylist(id: number) {
  return ipcRenderer.invoke("deletePlaylist", id)
}

export async function addToPlaylist(options: IAddTracksToPlaylistArgument) {
  ipcRenderer.send("addTracksToPlaylist", options)
}

export async function removeTracksFromPlaylist(
  options: IRemoveTracksFromPlaylistArgument
) {
  ipcRenderer.send("removeTracksFromPlaylist", options)
}

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

export async function setUserSettings<Key extends IUserSettingsKey>({
  setting,
  value,
}: {
  setting: Key
  value: IUserSettings[Key]
}) {
  return ipcRenderer.send("setUserSettings", { setting, value })
}

export async function selectDirectory(
  ...arguments_: Parameters<IMainQueryHandlers["openDirectoryPicker"]>
) {
  return ipcRenderer.invoke("openDirectoryPicker", arguments_[0], arguments_[1])
}

export async function selectImage(
  options: Parameters<IMainQueryHandlers["openImagePicker"]>[0]
) {
  return ipcRenderer.invoke("openImagePicker", options)
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
export function on<Key extends keyof IFrontendEventsConsume>(
  channel: Key,
  listener: IFrontendEventsConsume[Key]
) {
  ipcRenderer.on(channel, listener)

  // Return the unsubscribe function, because unsubscribing doesn't work otherwise.
  return () => ipcRenderer.removeListener(channel, listener)
}

export function resetMusic(): void {
  ipcRenderer.send("resetMusic")
}

export function getListeners(event: keyof IFrontendEventsSend) {
  return ipcRenderer.listeners(event)
}

export async function search(query: string) {
  return ipcRenderer.invoke("search", query)
}

export async function updatePlaylistCover(
  options: IPlaylistUpdateCoverArgumentSend
) {
  return ipcRenderer.invoke("updatePlaylistCover", options)
}
