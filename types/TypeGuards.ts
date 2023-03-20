import * as E from "fp-ts/lib/Either"

import type { Either, Right } from "fp-ts/lib/Either"
import type { IBackendQueryResponse } from "./IPC"

export function isError(error: unknown): error is Error {
  return error instanceof Error
}

export function isBackendQueryResponse(
  response: unknown
): response is IBackendQueryResponse {
  if (typeof response !== "object" || response === null) return false
  if (typeof (response as IBackendQueryResponse)?.queryID !== "string")
    return false
  if ((response as IBackendQueryResponse)?.data === undefined) return false

  return true
}

/**
 * Check if an array of Eithers contains only right values and narrow down the type.
 */
export function hasOnlyRightValues<
  T extends readonly Either<unknown, unknown>[]
>(
  array: T
  // @ts-ignore - It works but TS does not like it.
): array is T extends readonly Either<unknown, infer R>[] ? Right<R>[] : never {
  return array.some(E.isLeft)
}
