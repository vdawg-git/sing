const testIDNames = [
  "modal",
  "modalContent",
  "noContentMessage",
  "noContentModalButton",
  "playbar",
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
  "queueBarNextTracks",
  "queueBarPlayedTracks",
  "queueCurrentTrack",
  "queueCurrentTrackArtist",
  "queueCurrentTrackTitle",
  "queueNextTrack",
  "queueNextTrackArtist",
  "queueNextTrackTitle",
  "queuePlayedTracks",
  "queuePreviousTrack",
  "queuePreviousTrackArtist",
  "queuePreviousTrackTitle",
  "seekbar",
  "seekbarCurrentTime",
  "seekbarProgressbar",
  "seekbarProgressbarKnob",
  "seekbarTotalDuration",
  "volumeSlider",
  "volumeSliderInner",
  "testAudioELement",
] as const

const testGroupNames = [
  "queueItemArtist",
  "queueItemCover",
  "queueItemDeleteIcon",
  "queueItemTitle",
  "queueNextTracks",
  "queuePreviousTracks",
] as const
////////////////////////////////

type ITestIDs = {
  readonly [index in typeof testIDNames[number]]: index
} & {
  readonly asQuery: {
    readonly [i in typeof testIDNames[number]]: `[data-testid=${i}]`
  }
}

type ITestGroups = {
  readonly [index in typeof testGroupNames[number]]: index
} & {
  readonly asQuery: {
    readonly [i in typeof testGroupNames[number]]: `[data-testgroup=${i}]`
  }
}

export const TEST_IDS: ITestIDs = testIDNames.reduce((acc, name) => {
  if (!acc?.asQuery) acc["asQuery"] = {}
  if (!acc.asQuery?.noBrackets) acc["asQuery"]["noBrackets"] = {}

  acc[name] = name
  acc.asQuery[name] = `[data-testid=${name}]`

  return acc
}, {} as any)

export const testAttr: ITestGroups = testGroupNames.reduce((acc, name) => {
  if (!acc?.asQuery) acc["asQuery"] = {}
  if (!acc.asQuery?.noBrackets) acc["asQuery"]["noBrackets"] = {}

  acc[name] = name
  acc.asQuery[name] = `[data-testgroup=${name}]`

  return acc
}, {} as any)
