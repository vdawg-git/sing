import { getAlbum, getAlbums, getArtist, getArtists, getCovers, getTracks } from "./Crud"
import { search } from "./Search"

/**
 * The query handler which returns an answer (unlike the event handlers)
 * They get executed in the the `index.ts`
 */
export const queryHandlers = Object.freeze({
  getAlbum,
  getAlbums,
  getArtist,
  getArtists,
  getCovers,
  getTracks,
  search,
} as const)
