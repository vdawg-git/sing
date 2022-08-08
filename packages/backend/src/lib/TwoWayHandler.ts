import { getTracks } from "./Crud"

import type { Either } from "fp-ts/lib/Either"

import type { IError, ITrack } from "@sing-types/Types"
import type { InnerArray } from "@sing-types/Utilities"

export const twoWayHandler = {
  getTracks: async (
    options: InnerArray<Parameters<typeof getTracks>>
  ): Promise<Either<IError, readonly ITrack[]>> => {
    const response = await getTracks(options ?? undefined) // Child_process converts undefined to null during transmission, but undefined is needed to get all items

    return response
  },
} as const
