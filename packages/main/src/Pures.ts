import { readonlyArray as Arr } from "fp-ts"
import { curry2 } from "fp-ts-std/Function"
import { pipe } from "fp-ts/Function"
import { Either, isLeft, isRight, left, right } from "fp-ts/lib/Either"
import type { NullValuesToOptional } from "@sing-types/Types"
import {
  SUPPORTED_MUSIC_FORMATS,
  UNSUPPORTED_MUSIC_FORMATS,
} from "./lib/FileFormats"

export function filterPathsByExtenstions(
  extensions: readonly string[],
  paths: readonly string[]
): readonly string[] {
  return pipe(
    paths,
    Arr.filter((path: string) => {
      const pathExtension = getExtension(path)
      return includedInArray(extensions)(pathExtension)
    })
  )
}

export function getSupportedMusicFiles(
  filePaths: readonly string[]
): readonly string[] {
  return filterPathsByExtenstions(SUPPORTED_MUSIC_FORMATS, filePaths)
}

export function getUnsupportedMusicFiles(
  filePaths: readonly string[]
): readonly string[] {
  return filterPathsByExtenstions(UNSUPPORTED_MUSIC_FORMATS, filePaths)
}

export function getExtension(string: string): string {
  return string.split(".").at(-1) as string
}

function includedInArrayNotCurried(
  arr: readonly unknown[],
  value: unknown
): boolean {
  return arr.includes(value)
}
export const includedInArray = curry2(includedInArrayNotCurried)

export function isFileSupported(
  supportedExtensions: readonly string[],
  filePath: string
): boolean {
  return pipe(filePath, getExtension, includedInArray(supportedExtensions))
}

export function getLeftValues<E, A>(arr: Either<E, A>[]): E[] {
  return arr.filter(isLeft).map((value) => value.left)
}

export function getRightValues<E, A>(arr: Either<E, A>[]): A[] {
  return arr.filter(isRight).map((value) => value.right)
}

export function getLeftRight<E, A>(
  arr: Either<E, A>[]
): { left: E[]; right: A[] } {
  const result: { left: E[]; right: A[] } = {
    left: [],
    right: [],
  }

  for (const item of arr) {
    if (isLeft(item)) {
      result.left.push(item.left)
    } else {
      result.right.push(item.right)
    }
  }

  return result
}

function removeKeysNotCurried<
  obj extends object,
  keys extends readonly string[]
>(keysToRemove: keys, obj: obj): Omit<obj, keys[number]> {
  const result = Object.fromEntries(
    Object.entries(obj).filter(([key, _]) => !keysToRemove.includes(key))
  ) as Omit<obj, keys[number]>

  return result
}

export const removeKeys = curry2(removeKeysNotCurried)

// https://stackoverflow.com/a/69614645/9578667
export function flattenObject(
  obj: Record<string, unknown>,
  parent?: string
): Record<string, unknown> {
  let res: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    const propName = parent ? parent + capitalizeFirstLetter(key) : key
    const flattened: Record<string, unknown> = {}

    if (value instanceof Date) {
      flattened[key] = value.toISOString()
    } else if (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value)
    ) {
      res = {
        ...res,
        ...flattenObject(value as Record<string, unknown>, propName),
      }
    } else {
      res[propName] = value
    }
  }

  return res
}

export function capitalizeFirstLetter(string: string): string {
  return string[0].toUpperCase() + string.substring(1)
}

export function stringifyArraysInObject(
  obj: Record<string, unknown>
): Record<string, unknown> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (Array.isArray(value)) {
      acc[key] = JSON.stringify(value)
    } else if (typeof value === "object" && value !== null) {
      acc[key] = stringifyArraysInObject(value as Record<string, unknown>)
    } else {
      acc[key] = value
    }

    return acc
  }, {} as Record<string, unknown>)
}

export function objectsKeysInArrayToObject<
  T extends readonly Record<string, {}>[],
  K extends keyof T[number]
>(array: T): Record<K, T[number][K][]> {
  const result = array.reduce(
    (acc: Record<string, unknown[]>, curr: Record<string, unknown>) => {
      for (const [key, value] of Object.entries(curr)) {
        if (acc[key] === undefined) {
          acc[key] = [value]
        } else {
          acc[key].push(value)
        }
      }
      return acc
    },
    {}
  ) as Record<K, T[number][K][]>

  return result
}

/**
 * To be used with `Array.filter`
 * @example
 * const arr = [1, 1, ,1 , 2, 2]
 * const filtered = arr.filter(removeDuplicates) // => [1. 2]
 */
export function removeDuplicates<T extends unknown>(
  value: T,
  index: number,
  array: readonly T[]
): value is T {
  return (
    index ===
    array.findIndex((t) => {
      return JSON.stringify(t) === JSON.stringify(value)
    })
  )
}

export function removeNulledKeys<T extends {}>(
  obj: T
): NullValuesToOptional<T> {
  const result = Object.fromEntries(
    Object.entries(obj).filter(([_key, value]) => value !== null)
  ) as NullValuesToOptional<T>

  return result
}

export function getRightOrThrow<A, E>(either: Either<E, A>): A {
  if (isLeft(either)) throw new Error("" + either.left)

  return either.right
}

//?########################################################################
//?####################         TESTS            ##########################
//?########################################################################

if (import.meta.vitest) {
  const { expect, test } = await import("vitest")

  test("filterPathsByExtenstions happy", () => {
    const given = ["a.mp3", "b.alac", "c.txt", "d.flac"]
    const extensions = ["mp3", "flac"]
    const expected = ["a.mp3", "d.flac"]

    expect(filterPathsByExtenstions(extensions, given)).toEqual(expected)
  })

  test("removeKeys happy", () => {
    const given = {
      a: 1,
      b: 2,
      c: 3,
      d: 4,
    }
    const desired = {
      c: 3,
      d: 4,
    }

    expect(removeKeys(["a", "b"])(given)).toEqual(desired)
  })

  test("removeKeys sad", () => {
    const given = {
      a: 1,
      b: 2,
      c: 3,
      d: 4,
    }
    const desired = {
      a: 1,
      b: 2,
      c: 3,
      d: 4,
    }

    expect(removeKeys(["a", "b"])(given)).not.toEqual(desired)
  })

  test("flattenObject", () => {
    const given = {
      aa: "1",
      bb: {
        cc: "2",
        dd: "3",
      },
      ee: [1, 2, 3],
    }
    const desired = {
      aa: "1",
      bbCc: "2",
      bbDd: "3",
      ee: [1, 2, 3],
    }

    expect(flattenObject(given)).toEqual(desired)
  })

  test("stringifyArraysInObject", () => {
    const arr1 = ["a", "a"]
    const arr2 = ["d", "d"]

    const given = {
      a: arr1,
      b: "b",
      c: { d: arr2 },
      e: { f: "f" },
    }
    const expected = {
      a: JSON.stringify(arr1),
      b: "b",
      c: { d: JSON.stringify(arr2) },
      e: { f: "f" },
    }

    expect(stringifyArraysInObject(given)).toEqual(expected)
  })

  test("objectsKeysInArrayToObject", () => {
    const given = [
      { a: "d", b: "e", c: "f" },
      { a: "g", b: "h", c: "i" },
      { a: "j", b: "k", c: "l" },
    ]

    const expected = {
      a: ["d", "g", "j"],
      b: ["e", "h", "k"],
      c: ["f", "i", "l"],
    }

    expect(objectsKeysInArrayToObject(given)).toEqual(expected)
  })

  test("eitherArrayToObject", () => {
    const given = [left(1), right(2), left(3)]

    const expected = {
      left: [1, 3],
      right: [2],
    }

    expect(getLeftRight(given)).toEqual(expected)
  })

  test("removeDuplicates happy", () => {
    const given = ["a", "a", "b", "b", 1, 1]

    const expected = ["a", "b", 1]

    expect(given.filter(removeDuplicates)).toEqual(expected)
  })

  test("removeDuplicates sad", () => {
    const given = ["a", "a", "b", "b", 1, 1]

    const expected = ["a", "b", 1, 1]

    expect(given.filter(removeDuplicates)).not.toEqual(expected)
  })

  test("removeDuplicates happy 2", () => {
    const given = [{ a: 1 }, { a: 1 }, { a: 1 }, ["b"], ["b"], 3, 3, null, null]
    const expected = [{ a: 1 }, ["b"], 3, null]

    expect(given.filter(removeDuplicates)).toEqual(expected)
  })

  test("removeDuplicates sad 2", () => {
    const given = [{ a: 1 }, { a: 1 }, { a: 1 }, ["b"], ["b"], 3, 3]
    const expected = [{ a: 1 }, ["b"], 3, 3]

    expect(given.filter(removeDuplicates)).not.toEqual(expected)
  })

  test("eitherArrayToObject", () => {
    const given = [left(1), right(2), left(3)]

    const expected = {
      left: [1, 3],
      right: [2],
    }

    expect(getLeftRight(given)).toEqual(expected)
  })

  test("removeNulledKeys happy", () => {
    const given = {
      a: null,
      b: null,
      c: "hi",
      d: {},
    }

    const expected = {
      c: "hi",
      d: {},
    }

    expect(removeNulledKeys(given)).toEqual(expected)
  })

  test("removeNulledKeys sad", () => {
    const given = {
      a: null,
      b: null,
      c: "hi",
      d: undefined,
      e: {},
    }

    const notExpected = {
      c: "hi", // misses d key
      a: null,
    }

    expect(removeNulledKeys(given)).not.toEqual(notExpected)
  })

  test("getRightOrThrow happy", () => {
    const given: Either<unknown, string> = {
      right: "foo",
      _tag: "Right",
    }

    const expected = "foo"

    expect(getRightOrThrow(given)).toBe(expected)
  })

  test("getRightOrThrow sad", () => {
    const given: Either<unknown, string> = {
      left: "foo",
      _tag: "Left",
    }

    expect(() => getRightOrThrow(given)).toThrowError("foo")
  })
}
