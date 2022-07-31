import type {
  IBackendEmitToFrontend,
  IDataSendToBackend,
  ITwoWayRequest,
  ITwoWayResponse,
} from "@sing-types/Types"

import type { ICoverData } from "./Types"

import type { IPicture } from "music-metadata"

export function isICoverData(toTest: unknown): toTest is ICoverData {
  if (typeof toTest !== "object" || toTest === null) return false

  const keysToCheck: Record<keyof ICoverData, (x: unknown) => boolean> = {
    coverMD5: (x: unknown) => typeof x === "string",
    coverPath: (x: unknown) => typeof x === "string",
    coverBuffer: (x: unknown) => Buffer.isBuffer(x),
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

export function isTwoWayEvent(toTest: unknown): toTest is ITwoWayRequest {
  if (typeof toTest !== "object" || toTest === null) return false
  if (typeof (toTest as ITwoWayRequest)?.event !== "string") return false
  if (typeof (toTest as ITwoWayRequest)?.id !== "string") return false

  return true
}

export function isOneWayEvent(toTest: unknown): toTest is IDataSendToBackend {
  if (typeof toTest !== "object" || toTest === null) return false
  if ((toTest as ITwoWayResponse)?.id !== undefined) return false
  if (typeof (toTest as IDataSendToBackend)?.event !== "string") return false

  return true
}

export function isBackendMessageToForward(
  data: unknown
): data is IBackendEmitToFrontend {
  if (typeof data !== "object" || data === null) return false
  if ((data as IBackendEmitToFrontend)?.emitToRenderer !== true) return false
  if ((data as IBackendEmitToFrontend)?.event === undefined) return false
  if (!(("data" as keyof IBackendEmitToFrontend) in data)) return false

  return true
}

export function isEventToForwardToRenderer(
  data: unknown
): data is IBackendEmitToFrontend {
  if (typeof data !== "object" || data === null) return false
  if ((data as ITwoWayResponse)?.id !== undefined) return false
  if ((data as IBackendEmitToFrontend)?.event === undefined) return false
  if (!(("data" as keyof IBackendEmitToFrontend) in data)) return false

  return true
}

if (import.meta.vitest) {
  const { expect, test } = await import("vitest")

  test("isICoverData happy", () => {
    const given: ICoverData = {
      coverMD5: "coverMD5",
      coverPath: "coverPath",
      coverBuffer: Buffer.from("coverBuffer"),
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
