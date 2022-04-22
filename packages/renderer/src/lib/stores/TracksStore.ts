import { readable, type Subscriber } from "svelte/store"
import type { ITrack } from "@sing-types/Track"
import picocolors from "picocolors"

export default readable<Promise<ITrack[]> | ITrack[]>(initValue(), updateStore)

async function initValue() {
  return window.api.getTracks().then((tracks) => {
    if (!Array.isArray(tracks)) {
      console.group(picocolors.red("Received tracks are not valid"))
      console.error(tracks)
      console.groupEnd()

      return []
    }
    const result = tracks.sort(sortAlphabetically)
    return result
  })
}

function updateStore(set: Subscriber<ITrack[] | Promise<ITrack[]>>) {
  window.api.listen("on/tracks-added", (tracks: ITrack[]) => {
    updateStore(tracks)
  })

  // Return unsubscribe function
  return () => window.api.removeListener("on/tracks-added", updateStore)

  function updateStore(tracks: ITrack[]) {
    if (!tracks) {
      console.group(
        picocolors.red("Received tracks at tracksStore -> update are not valid")
      )
      console.error(tracks)
      console.groupEnd()

      return []
    }
    const newValue = [] as ITrack[]

    for (const track of tracks) {
      newValue.push(track)
    }

    set(newValue.sort(sortAlphabetically))
  }
}

function sortAlphabetically(a: ITrack, b: ITrack) {
  const titleA = a.title ? a.title.toLowerCase() : "!"
  const titleB = b.title ? b.title.toLowerCase() : "!"
  return titleA.localeCompare(titleB, undefined, { numeric: true })
}
