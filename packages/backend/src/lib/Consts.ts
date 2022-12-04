import type { ISQLDatabaseItemString } from "@/types/Types"

/**
 * Making the SQL strings typesafer
 */
export const SQL_STRINGS = {
  "Album.name": "Album.name",
  "Artist.name": "Artist.name",
  "Cover.filepath": "Cover.filepath",
  "Cover.md5": "Cover.md5",
  "PlaylistItem.trackID": "PlaylistItem.trackID",
  "PlaylistItem.playlistID": "PlaylistItem.playlistID",
  "Track.*": "Track.*",
  "Track.album": "Track.album",
  "Track.artist": "Track.artist",
  "Track.cover": "Track.cover",
  "Track.filepath": "Track.filepath",
  "Track.id": "Track.id",
  "Track.title": "Track.title",

  Album: "Album",
  Artist: "Artist",
  Cover: "Cover",
  PlaylistItem: "PlaylistItem",
  Track: "Track",
  filepath: "filepath",
  name: "name",
} satisfies { [item in ISQLDatabaseItemString]?: item }
