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
  "settingsFolders",
  "settingsFoldersSaveButton",
  "sidebar",
  "sidebarMenu",
  "sidebarMenuIcon",
  "slottedComponent",
  "myTracksTitle",
  "test",
  "testAudioELement",
  "testIcon",
  "volumeSlider",
  "volumeSliderInner",
] as const

const testGroupNames = [
  "folderInput",
  "folderInputDeleteIcon",
  "menuItem",
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
    readonly [i in typeof testGroupNames[number]]: `[data-testattribute=${i}]`
  }
}

export const TEST_IDS: ITestIDs = testIDNames.reduce((acc, name) => {
  if (!acc?.asQuery) acc["asQuery"] = {}

  acc[name] = name
  acc.asQuery[name] = `[data-testid=${name}]`

  return acc
}, {} as any)

export const testAttr: ITestGroups = testGroupNames.reduce((acc, name) => {
  if (!acc?.asQuery) acc["asQuery"] = {}

  acc[name] = name
  acc.asQuery[name] = `[data-testattribute=${name}]`

  return acc
}, {} as any)
