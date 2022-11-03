import { writable } from "svelte/store"

import type { FilePath } from "@sing-types/Filesystem"

// type IBackgroundImages =
//   | {
//       readonly type: "filepaths"
//       readonly images: readonly FilePath[]
//     }
//   | {
//       readonly type: "filepath"
//       readonly images: FilePath
//     }

const { set, subscribe } = writable<FilePath | FilePath[] | undefined>()

export const backgroundImages = {
  set,
  subscribe,
  reset() {
    set(undefined)
  },
}
