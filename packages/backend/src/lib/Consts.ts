import type { ISQLDatabaseItemString } from "@/types/Types"

/**
 * Making the SQL strings typesafer
 */
export const SQL_STRINGS: { [item in ISQLDatabaseItemString]?: item } = {
  "ALBUM.name": "ALBUM.name",
  "ARTIST.name": "ARTIST.name",
  "COVER.filepath": "COVER.filepath",
  "TRACK.album": "TRACK.album",
  "TRACK.cover": "TRACK.cover",
  "TRACK.title": "TRACK.title",
  "TRACK.artist": "TRACK.artist",
  ALBUM: "ALBUM",
  ARTIST: "ARTIST",
  COVER: "COVER",
  TRACK: "TRACK",
  filepath: "filepath",
  name: "name",
} as const
