export enum ROUTES {
  tracks = "tracks",
  "settings/general" = "settings/general",
  "settings/library" = "settings/library",
}

export enum NOTIFICATION_LABEL {
  syncStarted = "Started syncing music",
  syncSuccess = "Syncing music succesfully",
  syncFailure = "Syncing music failed",
}

export type IRoutes = keyof typeof ROUTES
