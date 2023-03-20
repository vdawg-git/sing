import * as E from "fp-ts/lib/Either"
import { match } from "ts-pattern"
import { pipe } from "fp-ts/lib/function"

import {
  displayTrackMetadata,
  notifiyError,
  sortAlphabetically,
} from "@/Helper"
import { dispatchToRedux } from "@/lib/stores/mainStore"

import { playbackActions, type IPlaybackState } from "./playbackSlice"

import type { IAlbum, IArtist, ITrack } from "@sing-types/DatabaseTypes"
import type {
  IError,
  IFetchPlaybackArgument,
  ISyncResult,
} from "@sing-types/Types"
import type { IQueueItemID, IQueueItem } from "@/types/Types"
import type { Either } from "fp-ts/lib/Either"
import type { Writable } from "svelte/store"
import type { IpcRendererEvent } from "electron"

export async function getTracksFromSource({
  source,
  isShuffleOn,
}: IFetchPlaybackArgument): Promise<Either<IError, readonly ITrack[]>> {
  return match(source)
    .with({ origin: "artist" }, async ({ sourceID }) =>
      window.api
        .getArtist({
          where: { name: sourceID },
          isShuffleOn,
        })
        .then(extractTracks)
    )

    .with({ origin: "album" }, async ({ sourceID }) =>
      window.api
        .getAlbum({
          where: { id: sourceID },
          isShuffleOn,
        })
        .then(extractTracks)
    )

    .with({ origin: "allTracks" }, () => window.api.getTracks({ isShuffleOn }))

    .with({ origin: "playlist" }, async ({ sourceID }) =>
      window.api
        .getPlaylist({
          where: { id: sourceID },
          isShuffleOn,
        })
        .then(extractTracks)
    )
    .exhaustive()

  function extractTracks(
    item: Either<IError, { tracks: readonly ITrack[] }>
  ): Either<IError, readonly ITrack[]> {
    return E.map(({ tracks }: { tracks: readonly ITrack[] }) => tracks)(item)
  }
}

// Get the cover data and set the metadata for the OS.
export async function setMediaSessionMetaData(track: ITrack | undefined) {
  if (track === undefined) {
    // eslint-disable-next-line unicorn/no-null
    navigator.mediaSession.metadata = null
    return
  }

  const coverData =
    track.cover &&
    URL.createObjectURL(
      await fetch(track.cover as string).then((response) => response.blob())
    )

  navigator.mediaSession.metadata = new MediaMetadata({
    title: displayTrackMetadata("title", track),
    album: displayTrackMetadata("album", track),
    artist: displayTrackMetadata("artist", track),
    artwork: (coverData as undefined) && [{ src: coverData }],
  })
}

export async function initialiseMediaKeysHandler({
  handlePlay,
  handlePause,
  handleNextTrack,
  handlePreviousTrack,
}: {
  handlePlay: () => void
  handlePause: () => void
  handleNextTrack: () => void
  handlePreviousTrack: () => void
}) {
  navigator.mediaSession.setActionHandler("play", handlePlay)
  navigator.mediaSession.setActionHandler("pause", handlePause)
  navigator.mediaSession.setActionHandler("stop", handlePause)
  navigator.mediaSession.setActionHandler("nexttrack", handleNextTrack)
  navigator.mediaSession.setActionHandler("previoustrack", handlePreviousTrack)
}

export function convertToQueueItem(track: ITrack, index: number): IQueueItem {
  return { index, track, queueID: (String(track.id) + index) as IQueueItemID }
}

export async function initialiseStores(
  tracksStore: Writable<readonly ITrack[]>,
  albumsStore: Writable<readonly IAlbum[]>,
  artistsStore: Writable<readonly IArtist[]>
) {
  pipe(
    await window.api.getTracks(),

    E.foldW(
      notifiyError("Failed to get tracks"),

      (newTracks) => {
        if (newTracks.length === 0) return

        tracksStore.set(newTracks)
        dispatchToRedux(playbackActions.setAutoQueue(newTracks))
      }
    )
  )

  pipe(
    await window.api.getAlbums(),

    E.foldW(
      notifiyError("Failed to get albums"),

      albumsStore.set
    )
  )

  pipe(
    await window.api.getArtists(),

    E.foldW(
      notifiyError("Failed to get artists"),

      artistsStore.set
    )
  )
}

export function handleSyncUpdate(
  tracksStore: Writable<readonly ITrack[]>,
  albumsStore: Writable<readonly IAlbum[]>,
  artistsStore: Writable<readonly IArtist[]>
): (_event: IpcRendererEvent, syncResult: ISyncResult) => Promise<void> {
  return async (_, syncResult) =>
    pipe(
      syncResult,
      E.foldW(
        notifiyError("Failed to update the library. Please restart the app"),

        ({ tracks, albums, artists }) => {
          const sortedTracks = [...tracks].sort(sortAlphabetically)

          if (tracks.length === 0) {
            console.warn(
              "Received tracks at tracksStore -> data is not valid:",
              {
                tracks,
                albums,
                artists,
              }
            )
          }

          // Update the stores
          tracksStore.set(sortedTracks)
          albumsStore.set(albums)
          artistsStore.set(artists)

          dispatchToRedux(playbackActions.intersect(sortedTracks))
        }
      )
    )
}

export function getCurrentTrack({
  index,
  manualQueue,
  autoQueue,
  isPlayingFromManualQueue,
}: IPlaybackState) {
  return isPlayingFromManualQueue
    ? manualQueue[0].track
    : autoQueue.at(index)?.track
}
