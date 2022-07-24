import { Either } from "fp-ts/lib/Either"

import { getTracks } from "./Crud"

import type { IError, InnerArray, ITrack } from "@sing-types/Types"

export const twoWayHandler = {
  getTracks: async (
    options: InnerArray<Parameters<typeof getTracks>>
  ): Promise<Either<IError, readonly ITrack[]>> => {
    const response = await getTracks(options ?? undefined) // Process converts undefined to null, but undefined is needed to get all items

    return response
  },
} as const
