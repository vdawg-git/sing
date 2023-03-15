import * as E from "fp-ts/lib/Either"
import { match } from "ts-pattern"
import { pipe } from "fp-ts/lib/function"

import {
  displayTrackMetadata,
  notifiyError,
  sortAlphabetically,
} from "@/Helper"
import { dispatch } from "@/lib/stores/mainStore"

import type { IAlbum, IArtist, ITrack } from "@sing-types/DatabaseTypes"
import type { IError, IPlayMeta, ISyncResult } from "@sing-types/Types"
import type { IQueueID, IQueueItem } from "@/types/Types"
import type { Either } from "fp-ts/lib/Either"
import type { Writable } from "svelte/store"
import type { IpcRendererEvent } from "electron"

export async function getTracksFromSource(
  playback: IPlayMeta
): Promise<Either<IError, readonly ITrack[]>> {
  return match(playback)
    .with({ source: "artist" }, async ({ sourceID, sortBy, isShuffleOn }) =>
      extractTracks(
        await window.api.getArtist({
          where: { name: sourceID },
          sortBy,
          isShuffleOn,
        })
      )
    )
    .with({ source: "album" }, async ({ sourceID, sortBy, isShuffleOn }) =>
      extractTracks(
        await window.api.getAlbum({
          where: { id: sourceID },
          sortBy,
          isShuffleOn,
        })
      )
    )
    .with({ source: "allTracks" }, ({ isShuffleOn, sortBy }) =>
      window.api.getTracks({ isShuffleOn, sortBy })
    )
    .with({ source: "playlist" }, async ({ sourceID, sortBy, isShuffleOn }) =>
      extractTracks(
        await window.api.getPlaylist({
          where: { id: sourceID },
          sortBy,
          isShuffleOn,
        })
      )
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
  // fetch(track?.cover)
  //   .then(({body}) => body)
  //   .then((json) => {
  //     if (!json) {
  //       return
  //     }
  //     const blob = new Blob([json.buffer])
  //     const img = new Image()
  //     img.src = URL.createObjectURL(blob)
  //     document.body.append(img)
  //   })

  const coverData =
    track?.cover &&
    URL.createObjectURL(
      await fetch((track as ITrack).cover as string).then((response) =>
        response.blob()
      )
    )

  navigator.mediaSession.metadata = new MediaMetadata({
    title: track && displayTrackMetadata("title", track),
    album: track && displayTrackMetadata("album", track),
    artist: track && displayTrackMetadata("artist", track),
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
  return { index, track, queueID: (String(track.id) + index) as IQueueID }
}

/**
 * Sets a new playback with random tracks.
 */
export async function goToRandomTracksPlayback() {
  const playback: IPlayMeta = {
    source: "allTracks",
    sortBy: ["title", "ascending"],
    isShuffleOn: true,
  }

  pipe(
    await getTracksFromSource(playback),

    E.foldW(
      notifiyError("Error while trying to play selected music"),

      (tracks) => {
        dispatch.playback.setNewPlayback({
          tracks,
          index: 0,
          meta: playback,
        })
      }
    )
  )
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
        dispatch.playback.setAutoQueue(newTracks)
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

          dispatch.playback.intersect(sortedTracks)
        }
      )
    )
}
