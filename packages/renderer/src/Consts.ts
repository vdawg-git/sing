export const routes = {
  tracks: "tracks",
  "settings/general": "settings/general",
  "settings/library": "settings/library",
} as const

export type IRoutes = keyof typeof routes
