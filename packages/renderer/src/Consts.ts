export enum ROUTES {
  tracks = "tracks",
  artists = "artists",
  albums = "albums",
  settingsGeneral = "settingsGeneral",
  settingsLibrary = "settingsLibrary",
}

export enum NOTIFICATION_LABEL {
  syncStarted = "Started syncing music",
  syncSuccess = "Syncing music succesfully",
  syncFailure = "Syncing music failed",
}

export type IRoutes = keyof typeof ROUTES
