import { titleToDisplay } from "@/Helper"
import c from "ansicolor"
import { isLeft } from "fp-ts/lib/Either"
import { readable } from "svelte/store"

import type { Either } from "fp-ts/lib/Either"
import type { Subscriber } from "svelte/store"

import type { IError, ITrack } from "@sing-types/Types"
import type { IpcRendererEvent } from "electron"

export default readable<readonly ITrack[]>(await initValue(), updateStore)

async function initValue() {
  const response = await window.api.getTracks()

  if (isLeft(response)) {
    console.error(response.left.error)
    return []
  }

  const tracks = response.right

  if (!Array.isArray(tracks)) {
    console.group(c.red("Received tracks are not valid. Tracks are:"))
    console.log(response.right)
    console.groupEnd()

    return []
  }
  const result = tracks.sort(sortAlphabetically)
  return result
}

function updateStore(set: Subscriber<readonly ITrack[]>) {
  window.api.listen("setMusic", update)

  return () => window.api.removeListener("setMusic", update)

  async function update(
    _event: IpcRendererEvent,
    response: Either<IError, readonly ITrack[]>
  ) {
    console.log(response)

    if (isLeft(response)) {
      console.error(response.left.error)
      return
    }
    const addedTracks = response.right

    if (!addedTracks || addedTracks.length === 0) {
      console.error(
        "Received tracks at tracksStore -> update is not valid",
        response
      )
      return
    }

    set([...addedTracks].sort(sortAlphabetically))
  }

  // Return unsubscribe function
}

function sortAlphabetically(a: ITrack, b: ITrack) {
  const titleA = titleToDisplay(a).toLowerCase()
  const titleB = titleToDisplay(b).toLowerCase()

  return titleA.localeCompare(titleB, undefined, { numeric: true })
}
