import { getAlbums, getCovers, getArtists, getTracks } from "./Crud"

export const twoWayHandlers = {
  getTracks,
  getCovers,
  getAlbums,
  getArtists,
} as const
