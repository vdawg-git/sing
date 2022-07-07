import type { ICoverData } from "./Types"
import type { IPicture } from "music-metadata"

export function isICoverData(toTest: unknown): toTest is ICoverData {
  if (typeof toTest !== "object" || toTest === null) return false

  const keysToCheck: Record<keyof ICoverData, (x: unknown) => boolean> = {
    coverMD5: (x: unknown) => typeof x === "string",
    coverPath: (x: unknown) => typeof x === "string",
    coverBuffer: (x: unknown) => Buffer.isBuffer(x),
  }

  return Object.entries(keysToCheck).every((i) => {
    const key = i[0] as keyof ICoverData

    if ((toTest as ICoverData)[key] === undefined) return false

    return keysToCheck[key]((toTest as ICoverData)[key])
  })
}

export function isIPicture(e: unknown): e is IPicture {
  if (typeof e !== "object" || e === null) return false
  if (!Buffer.isBuffer((e as IPicture)?.data)) return false
  if (typeof (e as IPicture)?.format !== "string") return false

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
