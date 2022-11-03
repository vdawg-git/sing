import {
  createPlaylist,
  deletePlaylist,
  getAlbum,
  getAlbums,
  getArtist,
  getArtists,
  getCovers,
  getPlaylist,
  getPlaylists,
  getTracks,
  renamePlaylist,
} from "./Crud"
import { search } from "./Search"

/**
 * The query handler which returns an answer (unlike the event handlers)
 * They get executed in the the `index.ts`
 */
export const queryHandlers = Object.freeze({
  createPlaylist,
  deletePlaylist,
  getAlbum,
  getAlbums,
  getArtist,
  getArtists,
  getCovers,
  getPlaylist,
  getPlaylists,
  getTracks,
  renamePlaylist,
  search,
} as const)
