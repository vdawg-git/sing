/* eslint-disable unicorn/no-array-reduce */
/* eslint-disable @typescript-eslint/no-explicit-any */

const testIDNames = [
  "albumCardsGrid",
  "artistCardsGrid",
  "heroHeading", // The whole hero
  "heroHeadingTitle", // The title of the hero
  "menu", // ContextMenu or dropdown menu
  "nothingHere",
  "playbar",
  "playbarAlbum",
  "playbarArtist",
  "playbarBackButton",
  "playbarCover",
  "playbarLoopIcon",
  "playbarNextButton",
  "playbarPauseButton",
  "playbarPlayButton",
  "playbarQueueIcon",
  "playbarShuffleButton",
  "playbarTitle",
  "playbarVolumeIcon",
  "playlistCardsGrid",
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
  "searchbar",
  "seekbar",
  "seekbarCurrentTime",
  "seekbarProgressbar",
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
  "trackList",
  "volumeSlider",
  "volumeSliderInner",
  "yourAlbumsTitle",
  "yourArtistsTitle",
  "yourPlaylistsTitl e",
  "yourTracksTitle",
] as const

const testAttributeNames = [
  "albumCard",
  "artistCard",
  "cardPlay",
  "cardSecondaryText",
  "cardTitle",
  "folderInput",
  "folderInputDeleteIcon",
  "menuItem", // Items of the context or dropdown menu
  "modalCloseButton",
  "modalContent",
  "modalWrapper",
  "notification",
  "notificationCloseButton",
  "playlistCard",
  "queueItem",
  "queueItemArtist",
  "queueItemCover",
  "queueItemDeleteIcon",
  "queueItemTitle",
  "queueManuallyAddedTracks",
  "queueNextTracks",
  "queuePreviousTracks",
  "searchbarResult",
  "searchbarResultAlbum",
  "searchbarResultArtist",
  "searchbarResultTitle",
  "searchbarResultType",
  "trackItem",
  "trackItemAlbum",
  "trackItemArtist",
  "trackItemCover",
  "trackItemDuration",
  "trackItemTitle",
] as const

type testIDs = {
  readonly [index in (typeof testIDNames)[number]]: index
} & {
  readonly asQuery: {
    readonly [index in (typeof testIDNames)[number]]: `[data-testid=${index}]`
  }
}

type testAttributes = {
  readonly [index in (typeof testAttributeNames)[number]]: index
} & {
  readonly asQuery: {
    readonly [index in (typeof testAttributeNames)[number]]: `[data-testattribute~=${index}]`
  }
}

export const TEST_IDS: testIDs = testIDNames.reduce((accumulator, name) => {
  if (!accumulator?.asQuery) accumulator.asQuery = {}

  accumulator[name] = name
  accumulator.asQuery[name] = `[data-testid=${name}]`

  return accumulator
}, {} as any)

export const TEST_ATTRIBUTES: testAttributes = testAttributeNames.reduce(
  (accumulator, name) => {
    if (!accumulator?.asQuery) accumulator.asQuery = {}

    accumulator[name] = name
    accumulator.asQuery[name] = `[data-testattribute~=${name}]`

    return accumulator
  },
  {} as any
)

export type ITestID = (typeof testIDNames)[number]
export type ITestAttribute = (typeof testAttributeNames)[number]
export type ITestAttributeAsQuery =
  testAttributes["asQuery"][keyof testAttributes["asQuery"]]
export type ITestIDAsQuery = testIDs["asQuery"][keyof testIDs["asQuery"]]
