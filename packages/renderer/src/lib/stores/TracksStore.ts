import { readable } from "svelte/store"
import type { Track as ITrack } from "@Prisma/client"

export default readable<Promise<ITrack[]> | ITrack[]>(
  window.api.getTracks().then((tracks) => tracks.sort(sortAlphabetically)),
  (set) => {
    window.api.listen("on/tracks-added", (tracks: ITrack[]) => {
      updateStore(tracks)
    })

    return () => {
      console.warn("Tracks Store unmounted")
      window.api.removeListener("on/tracks-added", updateStore)
    } // Remove listener when last store subscriber is removed

    function updateStore(tracks: ITrack[]) {
      const newValue = [] as ITrack[]

      for (const track of tracks) {
        newValue.push(track)
      }

      console.group("Updated tracks store")
      console.table(newValue)
      console.groupEnd()

      set(newValue.sort(sortAlphabetically))
    }
  }
)

function sortAlphabetically(a: ITrack, b: ITrack) {
  const titleA = a.title ? a.title.toLowerCase() : "!"
  const titleB = b.title ? b.title.toLowerCase() : "!"
  return titleA.localeCompare(titleB, undefined, { numeric: true })
}
