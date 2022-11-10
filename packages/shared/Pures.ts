import { pipe } from "fp-ts/Function"
import * as E from "fp-ts/lib/Either"
import * as A from "fp-ts/lib/ReadonlyArray"
import { curry2 } from "fp-ts-std/function"
import { match, P } from "ts-pattern"

import type { ITrackID } from "@sing-types/Opaque"

import { isKeyOfObject } from "../../types/Typeguards"
import {
  SUPPORTED_MUSIC_FORMATS,
  UNSUPPORTED_MUSIC_FORMATS,
} from "../backend/src/lib/FileFormats"

import type { FilePath } from "../../types/Filesystem"
import type {
  IMusicItems,
  IPlaylistTrack,
  ITrack,
} from "../../types/DatabaseTypes"
import type {
  IRawAudioMetadata,
  IRawAudioMetadataWithPicture,
  ISortOptions,
  ISortOrder,
} from "../../types/Types"
import type {
  KeyOfConditional,
  ArraysToString,
  FlattenObject,
  NullToUndefined,
} from "../../types/Utilities"
import type { Either } from "fp-ts/lib/Either"

export function filterPathsByExtenstions(
  extensions: readonly string[],
  paths: readonly FilePath[]
): readonly FilePath[] {
  return pipe(
    paths,
    A.filter((path) => {
      const pathExtension = getExtension(path)
      return includedInArray(extensions)(pathExtension)
    })
  )
}

export function convertFilepathToFilename(filepath: FilePath): string {
  const filename = filepath.split("/").at(-1) as string

  const dotLocation = filename?.lastIndexOf(".")

  const filenameWithoutExtension = filename?.slice(0, Math.max(0, dotLocation))

  return filenameWithoutExtension
}

export function convertFilepathToFilenameWithExtension(
  filepath: FilePath
): string {
  const filename = filepath.split("/").at(-1) as string

  return filename
}

export function getSupportedMusicFiles(
  filePaths: readonly FilePath[]
): readonly FilePath[] {
  return filterPathsByExtenstions(SUPPORTED_MUSIC_FORMATS, filePaths)
}

export function getUnsupportedMusicFiles(
  filePaths: readonly FilePath[]
): readonly string[] {
  return filterPathsByExtenstions(UNSUPPORTED_MUSIC_FORMATS, filePaths)
}

/**
 * Get the extension of a filepath.
 * @return The extension as a string or undefined if the filename does not have an extension.
 * @example
 * const path = "C:/Hi.mp3"
 * const extension = getExtension(path) //=> "mp3"
 *
 * const weirdFile = "C:/Nope"
 * const extension = getExtension(weirdFile) //=> undefined
 */
export function getExtension(string: FilePath): string | undefined {
  return string.split(".").at(-1)
}

function includedInArrayNotCurried(
  array: readonly unknown[],
  value: unknown
): boolean {
  return array.includes(value)
}
export const includedInArray = curry2(includedInArrayNotCurried)

export function isFileSupported(
  supportedExtensions: readonly string[],
  filePath: FilePath
): boolean {
  return pipe(filePath, getExtension, includedInArray(supportedExtensions))
}

export function getLeftValues<E, A>(array: Either<E, A>[]): E[] {
  return array.filter(E.isLeft).map((value) => value.left)
}

export function getRightValues<E, A>(array: Either<E, A>[]): A[] {
  return array.filter(E.isRight).map((value) => value.right)
}

export function getLeftsRights<E, A>(
  array: Either<E, A>[]
): { left: E[]; right: A[] } {
  const result: { left: E[]; right: A[] } = {
    left: [],
    right: [],
  }

  for (const item of array) {
    if (E.isLeft(item)) {
      result.left.push(item.left)
    } else {
      result.right.push(item.right)
    }
  }

  return result
}

function removeKeysNotCurried<T extends object, keys extends readonly string[]>(
  keysToRemove: keys,
  object_: T
): Omit<T, keys[number]> {
  const result = Object.fromEntries(
    Object.entries(object_).filter(([key, _]) => !keysToRemove.includes(key))
  ) as Omit<T, keys[number]>

  return result
}

export const removeKeys = curry2(removeKeysNotCurried)

// https://stackoverflow.com/a/69614645/9578667
export function flattenObject<Object_ extends Record<string, unknown>>(
  object: Object_,
  parent?: string
): FlattenObject<Object_> {
  let result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(object)) {
    const propertyName = parent ? parent + capitalizeFirstLetter(key) : key
    const flattened: Record<string, unknown> = {}

    if (value instanceof Date) {
      flattened[key] = value.toISOString()
    } else if (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value)
    ) {
      result = {
        ...result,
        ...flattenObject(value as Record<string, unknown>, propertyName),
      }
    } else {
      result[propertyName] = value
    }
  }

  return result as FlattenObject<Object_>
}

/**
 * Insert item(s) into an array.
 * @param insertAtIndex At which index to insert
 * @param data An array or a single item to insert
 * @returns An array
 */
export function insertIntoArray<T>(
  insertAtIndex: number,
  data: T | T[]
): (array: readonly T[]) => readonly T[] {
  return (array) => {
    const valuesBeforeInsert = array.slice(0, insertAtIndex)
    const valuesAfterInsert = array.slice(insertAtIndex)

    const dataToInsert = Array.isArray(data) ? data : [data]

    return [...valuesBeforeInsert, ...dataToInsert, ...valuesAfterInsert]
  }
}

export function capitalizeFirstLetter(string: string): string {
  return string[0].toUpperCase() + string.slice(1)
}

export function stringifyArraysInObject<T extends Record<string, unknown>>(
  object: T
): ArraysToString<T> {
  // eslint-disable-next-line unicorn/no-array-reduce
  return Object.entries(object).reduce((accumulator, [key, value]) => {
    if (Array.isArray(value)) {
      accumulator[key] = JSON.stringify(value)
    } else if (typeof value === "object" && value !== null) {
      accumulator[key] = stringifyArraysInObject(
        value as Record<string, unknown>
      )
    } else {
      accumulator[key] = value
    }

    return accumulator
  }, {} as Record<string, unknown>) as ArraysToString<T>
}

/**
 *
 * @param array The array of objects to transform
 * @example const array = [{a: 1, b: "Z"}, {a: 2, b: "X"}]
 *
 *  const transformed = objectsKeysInArrayToObject(array) // => {a: [1, 2], b: ["Z", "X"]}
 */
export function objectsKeysInArrayToObject<
  T extends readonly Record<string, unknown>[],
  K extends keyof T[number]
>(array: T): Record<K, T[number][K][]> {
  // eslint-disable-next-line unicorn/no-array-reduce
  const result = array.reduce(
    (
      accumulator: Record<string, unknown[]>,
      current: Record<string, unknown>
    ) => {
      for (const [key, value] of Object.entries(current)) {
        if (accumulator[key] === undefined) {
          accumulator[key] = [value]
        } else {
          accumulator[key].push(value)
        }
      }
      return accumulator
    },
    {}
  ) as Record<K, T[number][K][]>

  return result
}

/**
 *
 * @param key The key to update
 * @param updateFunction The function which updates the key. It receives the value of it.
 * @param object_ The object to with the key. It returns a shallow copy of it gets returned.
 * @returns
 */
export function updateKeyValue<
  T extends Record<string, unknown>,
  Key extends keyof T
>(key: Key, updateFunction: (previousValue: T[Key]) => T[Key], object_: T): T {
  return {
    ...object_,
    [key]: updateFunction(object_[key]),
  }
}

/**
 * To be used with `Array.filter`
 * @example
 * const arr = [1, 1, ,1 , 2, 2, 2]
 * const filtered = arr.filter(removeDuplicates)
 * // filtered  => [1 , 2]
 */
export function removeDuplicates<T>(
  value: T,
  index: number,
  array: readonly T[]
): value is T {
  return (
    index ===
    array.findIndex((t) => JSON.stringify(t) === JSON.stringify(value))
  )
}

export function removeNulledKeys<T extends Record<string | symbol, unknown>>(
  object: T
): NullToUndefined<T> {
  const result = Object.fromEntries(
    Object.entries(object).filter(([_, value]) => value !== null)
  ) as NullToUndefined<T>

  return result
}

export function getErrorMessage(
  defaultMessage: string,
  error: unknown
): string {
  if (typeof error === "string") {
    if (error.length === 0) return defaultMessage

    return error
  }
  if (typeof error !== "object" || error === null) return defaultMessage

  if (isKeyOfObject(error, "message") && typeof error.message === "string") {
    return error.message
  }
  if (isKeyOfObject(error, "error")) {
    return getErrorMessage(defaultMessage, error.error)
  }

  return defaultMessage
}

export function getRightOrThrow<A>(either: Either<unknown, A>): A {
  if (E.isLeft(either)) throw new Error(`${either.left}`)

  return either.right
}

export function hasCover(
  object: IRawAudioMetadata
): object is IRawAudioMetadataWithPicture {
  if (!Array.isArray(object.common?.picture)) return false

  return true
}

export function sortTracks([sortBy, sortOrder]:
  | ISortOptions["tracks"]
  | ISortOptions["playlist"]
  | ["RANDOM"]): <
  A extends Partial<Record<keyof ITrack | keyof IPlaylistTrack, unknown>>
>(
  tracks: readonly A[]
) => readonly A[] {
  return (tracks) => {
    if (sortBy === "RANDOM") {
      return shuffleArray(tracks)
    }

    const sorted = [...tracks].sort((a, b) => {
      // If the value at the specified key is undefined, then sort by the title or if this one is undefined, too, sort by the filename
      if (b[sortBy] === undefined) return -1
      if (a[sortBy] === undefined) return 1

      if (typeof a[sortBy] === "number" && typeof b[sortBy] === "number") {
        return (a[sortBy] as number) - (b[sortBy] as number)
      }

      if (typeof a[sortBy] === "string" && typeof b[sortBy] === "string") {
        return sortString(a[sortBy] as string, b[sortBy] as string)
      }

      throw new Error(`Invalid sort type. \na: ${a[sortBy]} \nb: ${b[sortBy]}`)
    })

    // The sort was done ascending, reverse it if it should be descending
    return sortOrder === "ascending" ? sorted : sorted.reverse()
  }
}

/**
 * @param sortBy The key which values get sorted. Only numbers and strings are supported
 */
export function sortByKey<T extends Record<string, unknown>>(
  [sortBy, sortOrder]:
    | readonly [KeyOfConditional<T, string | number>, ISortOrder]
    | readonly ["RANDOM"],
  array: readonly T[]
): readonly T[] {
  if (sortBy === "RANDOM") {
    return shuffleArray(array)
  }

  const sorted = [...array].sort((a, b) => {
    if (typeof a[sortBy] === "string" && typeof a[sortBy] === "string") {
      return sortString(a[sortBy] as string, b[sortBy] as string)
    }

    if (typeof a[sortBy] === "number" && typeof b[sortBy] === "number") {
      return (a[sortBy] as number) - (b[sortBy] as number)
    }

    throw new Error(
      `Invalid value to sort. Sortable types are "string & string" and "number & number". Received types: \nA: "${typeof a[
        sortBy
      ]}" with the value "${a[sortBy]}" \nand B: type "${typeof b[
        sortBy
      ]}" with the value "${a[sortBy]}"`
    )
  }) as unknown as T[]

  return sortOrder === "ascending" ? sorted : sorted.reverse()
}

export function shuffleArray<T>(array: readonly T[]): readonly T[] {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
}

/**
 * Not really pure, please dont judge me
 * @param max The maximum
 * @returns An integer from 0 to max
 */
export function createRandomIntegerFromZeroTo(max: number) {
  return Math.max(0, Math.floor(max * Math.random()))
}

/**
 * To be used with a Array.prototype.sort() argument
 */
export function sortString(a2: string, b2: string): 0 | -1 | 1 {
  if (a2 > b2) return 1
  if (a2 < b2) return -1
  return 0
}

/**
 * To be used with `Array.reduce`
 * @param total
 * @param toAdd
 * @returns The total of the summed numbers
 */
export function sumUpNumber(total: number, toAdd: number): number {
  return total + toAdd
}

/**
 * Designed to be used with `Array.filter()`, but also on its own
 * @param item To item to be checked
 * @returns True if the item is truthy, false otherwise
 */
export function filterOutFalsy<T>(
  item: T | undefined | false | "" | null | 0
): item is T {
  if (item === undefined) return false

  return true
}

/**
 *
 * Receives a common database item, like an album, playlist etc, and returns its tracks.
 * Also accepts arrays.
 * @returns ITrack[]
 */
export function extractTracks(argument: IMusicItems): readonly ITrack[] {
  return (
    match(argument)
      // Is an array of database items with tracks
      .with(P.array({ tracks: P.any }), (data) =>
        data.flatMap(({ tracks }) => tracks)
      )

      // Is one item with tracks
      .with({ tracks: P.array(P.any) }, ({ tracks }) => tracks)

      // Is an array of tracks
      .with(P.array({ title: P.string }), (tracks) => tracks)

      // Is a track
      .with({ title: P.string }, (track) => [track])

      .run()
  )
}

/**
 * Receives a common database item, like an album, playlist etc, and returns its track IDs.
 * Also accepts arrays.
 * @returns ITrack[]
 */
export function extractTrackIDs(argument: IMusicItems): readonly ITrackID[] {
  return extractTracks(argument).map(({ id }) => id)
}

/**
 * @example const a = ["a", "b", "'c'"]
 * const b = createSQLArray(a) //=>
 *    " 'a' , 'b' , ''c'' "
 * @param array An array of strings to join for a SQL query.
 */
export function createSQLArray(array: readonly (string | number)[]): string {
  return (
    array
      // Prevent the query from breaking if a value contains single quote(s)
      .map((path) => String(path).replace(/'/g, "''"))
      .map((path) => `'${path}'`)
      .join(",")
  )
}

/**
 * Returns a string like: "2 types" or "1 type", depending on the count.
 */
export function displayTypeWithCount(type: string, count: number): string {
  return `${count} ${addPluralS(type, count)}`
}

export function addPluralS(string: string, count: number): string {
  if (count >= 0 && count !== 1) {
    return string + "s"
  }

  return string
}

// ?########################################################################
// ?####################         TESTS            ##########################
// ?########################################################################

// @ts-ignore
if (import.meta.vitest) {
  const { expect, test } = await import("vitest")

  test("filterPathsByExtenstions happy", () => {
    const given = ["a.mp3", "b.alac", "c.txt", "d.flac"] as FilePath[]
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
    const array1 = ["a", "a"]
    const array2 = ["d", "d"]

    const given = {
      a: array1,
      b: "b",
      c: { d: array2 },
      e: { f: "f" },
    }
    const expected = {
      a: JSON.stringify(array1),
      b: "b",
      c: { d: JSON.stringify(array2) },
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
    const given = [E.left(1), E.right(2), E.left(3)]

    const expected = {
      left: [1, 3],
      right: [2],
    }

    expect(getLeftsRights(given)).toEqual(expected)
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
    // eslint-disable-next-line unicorn/no-null
    const given = [{ a: 1 }, { a: 1 }, { a: 1 }, ["b"], ["b"], 3, 3, null, null]
    // eslint-disable-next-line unicorn/no-null
    const expected = [{ a: 1 }, ["b"], 3, null]

    expect(given.filter(removeDuplicates)).toEqual(expected)
  })

  test("removeDuplicates sad 2", () => {
    const given = [{ a: 1 }, { a: 1 }, { a: 1 }, ["b"], ["b"], 3, 3]
    const expected = [{ a: 1 }, ["b"], 3, 3]

    expect(given.filter(removeDuplicates)).not.toEqual(expected)
  })

  test("eitherArrayToObject", () => {
    const given = [E.left(1), E.right(2), E.left(3)]

    const expected = {
      left: [1, 3],
      right: [2],
    }

    expect(getLeftsRights(given)).toEqual(expected)
  })

  test("removeNulledKeys happy", () => {
    const given = {
      // eslint-disable-next-line unicorn/no-null
      a: null,
      // eslint-disable-next-line unicorn/no-null
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
      // eslint-disable-next-line unicorn/no-null
      a: null,
      // eslint-disable-next-line unicorn/no-null
      b: null,
      c: "hi",
      d: undefined,
      e: {},
    }

    const notExpected = {
      c: "hi", // misses d key
      // eslint-disable-next-line unicorn/no-null
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
