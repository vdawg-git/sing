import { readable, type Subscriber } from "svelte/store"
import type { ITrack } from "@sing-types/Types"
import c from "ansicolor"
import { titleToDisplay } from "@/Helper"
import CHANNELS from "@sing-preload/Channels"
import log from "ololog"

export default readable<Promise<ITrack[]> | ITrack[]>(initValue(), updateStore)

async function initValue() {
  return window.api.getTracks().then((tracks) => {
    if (!Array.isArray(tracks)) {
      console.group(c.red("Received tracks are not valid"))
      console.error(tracks)
      console.groupEnd()

      return []
    }
    const result = tracks.sort(sortAlphabetically)
    return result
  })
}

function updateStore(set: Subscriber<ITrack[] | Promise<ITrack[]>>) {
  window.api.listen(CHANNELS.ON_TRACKS_ADDED, update)

  // Return unsubscribe function
  return () => window.api.removeListener(CHANNELS.ON_TRACKS_ADDED, update)

  async function update(tracks: ITrack[]) {
    if (!tracks || !tracks.length) {
      console.group(
        c.red("Received tracks at tracksStore -> update is not valid")
      )
      console.error(tracks)
      console.groupEnd()

      return []
    }

    set(tracks.sort(sortAlphabetically))
  }
}

function sortAlphabetically(a: ITrack, b: ITrack) {
  const titleA = titleToDisplay(a).toLowerCase()
  const titleB = titleToDisplay(b).toLowerCase()

  return titleA.localeCompare(titleB, undefined, { numeric: true })
}
