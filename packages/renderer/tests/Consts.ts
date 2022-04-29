const testIDNames = [
  "modal",
  "modalContent",
  "noContentMessage",
  "noContentModalButton",
  "playbarAlbum",
  "playbarArtist",
  "playbarBackButton",
  "playbarCover",
  "playbarLoopIcon",
  "playbarModeIcon",
  "playbarNextButton",
  "playbarPauseButton",
  "playbarPlayButton",
  "playbarQueueIcon",
  "playbarTitle",
  "playbarVolumeIcon",
  "queueBar",
  "queueBar",
  "queueCurrentTrack",
  "queueNextTrack",
  "queuePlayedTracks",
  "queuePreviousTrack",
  "queueUpNextTracks",
  "seekbaarDuriation",
  "seekbarCurrentTime",
  "seekbarProgressbar",
] as const

const testGroupNames = ["queueUPreviousTracks", "queueNextTracks"] as const
////////////////////////////////

export const testIDs = testIDNames.reduce((acc, name) => {
  acc[name] = name

  return acc
}, {} as Record<typeof testIDNames[number], string>)

export const testGroups = testGroupNames.reduce((acc, name) => {
  acc[name] = name

  return acc
}, {} as Record<typeof testGroupNames[number], string>)
