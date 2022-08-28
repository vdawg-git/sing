import { ipcRenderer } from "./TypedIPC"

import type { MarkRequired } from "ts-essentials"

import type {
  IAlbumWithTracks,
  IArtistWithTracks,
  IError,
  ITracksSort,
} from "@sing-types/Types"

import type { Either } from "fp-ts/lib/Either"

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

type WithTracksSort<T> = { prismaOptions: T } & { orderBy: ITracksSort }

export async function getTracks(
  options: MarkRequired<Prisma.TrackFindManyArgs, "orderBy">
) {
  return ipcRenderer.invoke("getTracks", options)
}
export async function getAlbums(options?: Prisma.AlbumFindManyArgs) {
  return ipcRenderer.invoke("getAlbums", options)
}

export async function getAlbum(options: Prisma.AlbumFindUniqueOrThrowArgs) {
  return ipcRenderer.invoke("getAlbum", options)
}

export async function getAlbumWithTracks({
  prismaOptions,
  orderBy,
}: WithTracksSort<Prisma.AlbumFindUniqueOrThrowArgs>): Promise<
  Either<IError, IAlbumWithTracks>
> {
  return getAlbum({
    ...prismaOptions,
    include: { tracks: { orderBy } },
  })
}

export async function getArtists(options?: Prisma.ArtistFindManyArgs) {
  return ipcRenderer.invoke("getArtists", options)
}

export async function getArtist(options: Prisma.ArtistFindUniqueOrThrowArgs) {
  return ipcRenderer.invoke("getArtist", options)
}

export async function getArtistWithTracks({
  prismaOptions,
  orderBy,
}: WithTracksSort<Prisma.AlbumFindUniqueOrThrowArgs>) {
  return getArtist({
    ...prismaOptions,
    include: { tracks: { orderBy } },
  }) as Promise<Either<IError, IArtistWithTracks>>
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

  return () => ipcRenderer.removeListener(channel, listener)
}

export function resetMusic(): void {
  ipcRenderer.send("resetMusic")
}

export function getListeners(event: keyof IFrontendEventsSend) {
  ipcRenderer.listeners(event)
}
