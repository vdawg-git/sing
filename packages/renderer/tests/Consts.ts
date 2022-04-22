const testIDNames = [
  "modal",
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

////////////////////////////////

export const testIDs = testIDNames.reduce((acc, name) => {
  acc[name] = name

  return acc
}, {} as Record<typeof testIDNames[number], string>)
