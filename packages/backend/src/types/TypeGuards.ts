import type { FilePath } from "@sing-types/Filesystem"
import type {
  IBackendEmitToFrontend,
  IBackendEvent,
  IBackendQuery,
  IBackendQueryResponse,
} from "@sing-types/IPC"

import type { ICoverData } from "./Types"
import type { IPicture } from "music-metadata"

export function isICoverData(toTest: unknown): toTest is ICoverData {
  if (typeof toTest !== "object" || toTest === null) return false

  const keysToCheck: Record<keyof ICoverData, (x: unknown) => boolean> = {
    md5: (x: unknown) => typeof x === "string",
    path: (x: unknown) => typeof x === "string",
    buffer: (x: unknown) => Buffer.isBuffer(x),
  }

  return Object.entries(keysToCheck).every((keyValue) => {
    const key = keyValue[0] as keyof ICoverData

    if ((toTest as ICoverData)[key] === undefined) return false

    return keysToCheck[key]((toTest as ICoverData)[key])
  })
}

export function isIPicture(toTest: unknown): toTest is IPicture {
  if (typeof toTest !== "object" || toTest === null) return false
  if (!Buffer.isBuffer((toTest as IPicture)?.data)) return false
  if (typeof (toTest as IPicture)?.format !== "string") return false

  return true
}

export function isBackendQuery(toTest: unknown): toTest is IBackendQuery {
  if (typeof toTest !== "object" || toTest === null) return false
  if (typeof (toTest as IBackendQuery)?.query !== "string") return false
  if (typeof (toTest as IBackendQuery)?.queryID !== "string") return false

  return true
}

export function isBackendEvent(toTest: unknown): toTest is IBackendEvent {
  if (typeof toTest !== "object" || toTest === null) return false
  if ((toTest as IBackendQueryResponse)?.queryID !== undefined) return false
  if (typeof (toTest as IBackendEvent)?.event !== "string") return false

  return true
}

export function isBackendMessageToForward(
  data: unknown
): data is IBackendEmitToFrontend {
  if (typeof data !== "object" || data === null) return false
  if ((data as IBackendEmitToFrontend)?.shouldForwardToRenderer !== true)
    return false
  if ((data as IBackendEmitToFrontend)?.event === undefined) return false

  return true
}

export function isEventToForwardToRenderer(
  data: unknown
): data is IBackendEmitToFrontend {
  if (typeof data !== "object" || data === null) return false
  if ((data as IBackendQueryResponse)?.queryID !== undefined) return false
  if ((data as IBackendEmitToFrontend)?.event === undefined) return false
  if (!(("data" as keyof IBackendEmitToFrontend) in data)) return false

  return true
}

if (import.meta.vitest) {
  const { expect, test } = await import("vitest")

  test("isICoverData happy", () => {
    const given: ICoverData = {
      md5: "coverMD5",
      path: "path" as FilePath,
      buffer: Buffer.from("coverBuffer"),
    }

    expect(isICoverData(given)).toBe(true)
  })

  test("isICoverData sad", () => {
    const given = {
      coverPath: "coverPath",
      coverBuffer: Buffer.from("coverBuffer"),
    }

    expect(isICoverData(given)).toBe(false)
  })

  test("isICoverData sad 2", () => {
    const given = {
      coverMD5: 1,
      coverPath: 2,
      coverBuffer: "3",
    }

    expect(isICoverData(given)).toBe(false)
  })
}
