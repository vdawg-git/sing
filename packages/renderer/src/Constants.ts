import type { IAlbum, IArtist } from "@sing-types/DatabaseTypes"
import type { IPlaylistID } from "@sing-types/Opaque"

export enum ROUTES {
  tracks = "tracks",
  artists = "artists",
  albums = "albums",
  playlists = "playlists",
  settingsGeneral = "settingsGeneral",
  settingsLibrary = "settingsLibrary",
}

export enum NOTIFICATION_LABEL {
  syncStarted = "Syncing..",
  syncSuccess = "Syncing music succesfully",
  syncFailure = "Syncing music failed",
}

export type IMainRoutes = keyof typeof ROUTES

type IArtistRoute = `${typeof ROUTES.artists}/${IArtist["name"]}`

type IAlbumRoute = `${typeof ROUTES.albums}/${IAlbum["id"]}`

type IPlaylistRoute = `${typeof ROUTES.playlists}/${IPlaylistID}`

export type IRoutes = IMainRoutes | IPlaylistRoute | IArtistRoute | IAlbumRoute

export function createArtistURI(artistId: IArtist["name"]): IArtistRoute {
  return `${ROUTES.artists}/${artistId}`
}

export function createAlbumURI(albumId: IAlbum["id"]): IAlbumRoute {
  return `${ROUTES.albums}/${albumId}`
}

export function createPlaylistURI(plalylistID: IPlaylistID): IPlaylistRoute {
  return `${ROUTES.playlists}/${plalylistID}`
}
