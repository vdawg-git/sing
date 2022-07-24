import log from "ololog"

import { syncDirectories } from "./Sync"

import type { IFrontendEvents, InnerArray } from "@sing-types/Types"

export const oneWayHandler = {
  syncMusic: async ([coversDirectory, directories]: InnerArray<
    Parameters<typeof syncDirectories>
  >) => {
    log("Started to sync")
    const data = await syncDirectories(coversDirectory, directories)

    const event: keyof IFrontendEvents = "setMusic"

    return {
      forwardToRenderer: true,
      event,
      data,
    } as const
  },
}
