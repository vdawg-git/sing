import { readable } from "svelte/store"
import { pipe } from "fp-ts/lib/function"
import * as E from "fp-ts/lib/Either"

import type { IPlaylist } from "@sing-types/Types"

import { notifiyError } from "@/Helper"

export const playlistsStore = readable<readonly IPlaylist[]>([], (set) => {
  window.api
    .getPlaylists()
    .then(
      E.getOrElse(() => {
        notifiyError("Could not retrieve updated playlists")
        return [] as readonly IPlaylist[]
      })
    )
    .then(set)

  // Return the unsubscribe function
  return window.api.on("playlistsUpdated", () => updatePlaylists(set))
})

async function updatePlaylists(
  setFunction: (playlists: readonly IPlaylist[]) => void
): Promise<void> {
  pipe(
    await window.api.getPlaylists(),

    E.foldW(
      notifiyError("Could not retrieved updated playlists"),

      setFunction
    )
  )
}
