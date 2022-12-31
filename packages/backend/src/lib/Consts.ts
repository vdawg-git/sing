import type { ISQLDatabaseItemString } from "@/types/Types"

/**
 * Making the SQL strings typesafer
 */
export const SQL_STRINGS = {
  "Album.artist": "Album.artist",
  "Album.id": "Album.id",
  "Album.name": "Album.name",
  "Artist.name": "Artist.name",
  "Cover.filepath": "Cover.filepath",
  "Cover.md5": "Cover.md5",
  "PlaylistItem.playlistID": "PlaylistItem.playlistID",
  "PlaylistItem.trackID": "PlaylistItem.trackID",
  "Track.*": "Track.*",
  "Track.album": "Track.album",
  "Track.albumID": "Track.albumID",
  "Track.albumartist": "Track.albumartist",
  "Track.artist": "Track.artist",
  "Track.cover": "Track.cover",
  "Track.filepath": "Track.filepath",
  "Track.id": "Track.id",
  "Track.title": "Track.title",
  id: "id",

  Album: "Album",
  Artist: "Artist",
  Cover: "Cover",
  PlaylistItem: "PlaylistItem",
  Track: "Track",
  filepath: "filepath",
  name: "name",
} satisfies { [item in ISQLDatabaseItemString]?: item }
