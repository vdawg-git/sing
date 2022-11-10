import type { ISQLDatabaseItemString } from "@/types/Types"

/**
 * Making the SQL strings typesafer
 */
export const SQL_STRINGS: { [item in ISQLDatabaseItemString]?: item } = {
  "Album.name": "Album.name",
  "Artist.name": "Artist.name",
  "Cover.filepath": "Cover.filepath",
  "Track.album": "Track.album",
  "Track.cover": "Track.cover",
  "Track.title": "Track.title",
  "Track.artist": "Track.artist",
  "Track.*": "Track.*",
  Album: "Album",
  Artist: "Artist",
  Cover: "Cover",
  Track: "Track",
  filepath: "filepath",
  name: "name",
}
