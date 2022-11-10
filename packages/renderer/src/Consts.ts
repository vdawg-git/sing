import type { IPlaylistID, ITrackID } from "@sing-types/Opaque"

export enum ROUTES {
  tracks = "tracks",
  artists = "artists",
  albums = "albums",
  playlists = "playlists",
  settingsGeneral = "settingsGeneral",
  settingsLibrary = "settingsLibrary",
}

export enum NOTIFICATION_LABEL {
  syncStarted = "Started syncing music",
  syncSuccess = "Syncing music succesfully",
  syncFailure = "Syncing music failed",
}

export type IMainRoutes = keyof typeof ROUTES

export type IRoutes =
  | IMainRoutes
  | `${typeof ROUTES.playlists}/${IPlaylistID}`
  | `${typeof ROUTES.tracks}/${ITrackID}`
  | `${typeof ROUTES.albums | typeof ROUTES.artists}/${string}`
