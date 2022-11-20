import { derived, writable } from "svelte/store"

import type { IPlayLoop } from "@/types/Types"

const states: IPlayLoop[] = ["NONE", "LOOP_QUEUE", "LOOP_TRACK"]

const index = writable(0)

export function setNextLoopState() {
  index.update(($index) => {
    if ($index === states.length - 1) {
      return 0
    }

    return $index + 1
  })
}

export const loopStateStore = derived(index, ($index) => states[$index])
