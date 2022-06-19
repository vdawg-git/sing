const testIDNames = [
  "modal",
  "modalContent",
  "myTracksTitle",
  "noContentMessage",
  "noContentModalButton",
  "pageTrackContent",
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
  "settingsFoldersEmptyInput",
  "settingsFoldersSaveButton",
  "sidebar",
  "sidebarMenu",
  "sidebarMenuIcon",
  "slottedComponent",
  "test",
  "testAudioELement",
  "testIcon",
  "volumeSlider",
  "volumeSliderInner",
] as const

const testAttributeNames = [
  "folderInput",
  "folderInputDeleteIcon",
  "menuItem",
  "queueItem",
  "queueItemArtist",
  "queueItemCover",
  "queueItemDeleteIcon",
  "queueItemTitle",
  "queueNextTracks",
  "queuePreviousTracks",
  "trackItem",
  "trackItemAlbum",
  "trackItemArtist",
  "trackItemCover",
  "trackItemDuration",
  "trackItemTitle",
] as const
////////////////////////////////

type ITestIDs = {
  readonly [index in typeof testIDNames[number]]: index
} & {
  readonly asQuery: {
    readonly [i in typeof testIDNames[number]]: `[data-testid=${i}]`
  }
}

type ITestAttributes = {
  readonly [index in typeof testAttributeNames[number]]: index
} & {
  readonly asQuery: {
    readonly [i in typeof testAttributeNames[number]]: `[data-testattribute=${i}]`
  }
}

export const TEST_IDS: ITestIDs = testIDNames.reduce((acc, name) => {
  if (!acc?.asQuery) acc["asQuery"] = {}

  acc[name] = name
  acc.asQuery[name] = `[data-testid=${name}]`

  return acc
}, {} as any)

export const testAttr: ITestAttributes = testAttributeNames.reduce(
  (acc, name) => {
    if (!acc?.asQuery) acc["asQuery"] = {}

    acc[name] = name
    acc.asQuery[name] = `[data-testattribute=${name}]`

    return acc
  },
  {} as any
)
