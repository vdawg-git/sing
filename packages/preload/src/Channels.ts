const ON_TRACKS_ADDED = "on/tracks-added" as const
const ON_TRACKS_UPDATED = "on/tracks-added" as const

const CHANNELS = {
  GET_PATH: "get/path",
  GET_TRACKS: "get/tracks",
  SET_USER_SETTINGS: "set/userSettings",
  GET_USER_SETTINGS: "get/userSettings",
  SYNC: "sync",
  OPEN_DIR: "open-directory",
  OPEN_MUSIC_FOLDER: "open-music-folder",
  TEST: "test",
  ON_TRACKS_ADDED,
  ON_TRACKS_UPDATED,
  RESET_MUSIC: "reset-music",
  listener: [ON_TRACKS_ADDED],
} as const

export default CHANNELS
