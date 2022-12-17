import * as E from "fp-ts/lib/Either"
import { match } from "ts-pattern"

import { displayTrackMetadata } from "@/Helper"

import type { ITrack } from "@sing-types/DatabaseTypes"
import type { IError, IPlayback } from "@sing-types/Types"
import type { Either } from "fp-ts/lib/Either"

export async function getTracksFromSource(
  playback: IPlayback
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
