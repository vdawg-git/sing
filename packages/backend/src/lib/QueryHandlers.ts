import { getAlbum, getAlbums, getArtist, getArtists, getCovers, getTracks } from "./Crud"

export const queryHandlers = Object.freeze({
  getAlbum,
  getAlbums,
  getArtist,
  getArtists,
  getCovers,
  getTracks,
} as const)
