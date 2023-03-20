import { pipe } from "fp-ts/lib/function"
import * as O from "fp-ts/Option"
import * as RA from "fp-ts/ReadonlyArray"
import * as E from "fp-ts/lib/Either"
import * as A from "fp-ts/lib/ReadonlyArray"
import { moveFrom } from "fp-ts-std/Array"
import { curry2 } from "fp-ts-std/Function"
import { match, P } from "ts-pattern"
import { deleteAt } from "fp-ts/lib/Array"
import { toUndefined } from "fp-ts/lib/Option"

import {
  SUPPORTED_MUSIC_FORMATS,
  UNSUPPORTED_MUSIC_FORMATS,
} from "../backend/src/lib/FileFormats"

import type { Option } from "fp-ts/lib/Option"
import type { ITrackID } from "../../types/Opaque"
import type { FilePath } from "../../types/Filesystem"
import type { IMusicItems, ITrack } from "../../types/DatabaseTypes"
import type {
  IRawAudioMetadata,
  IRawAudioMetadataWithPicture,
  ITracksSortKeys,
  RANDOM,
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

  const dotLocation = filename.lastIndexOf(".")

  const filenameWithoutExtension = filename?.slice(
    0,
    Math.max(0, dotLocation === -1 ? Number.POSITIVE_INFINITY : dotLocation)
  )

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

// TODO use immer for this
/**
 *
 * @param key The key to update
 * @param updateFunction The function which updates the key. It receives the value of it.
 * @param object_ The object with the key. A shallow copy of it gets returned.
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

  if ("message" in error && typeof error.message === "string") {
    return error.message
  }
  if ("error" in error) {
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

export function sortTracks(
  sortBy: ITracksSortKeys | RANDOM
): (tracks: readonly ITrack[]) => readonly ITrack[] {
  return (tracks) => {
    if (sortBy === "RANDOM") {
      return shuffleArray(tracks)
    }

    const sorted = [...tracks].sort((trackA, trackB) => {
      const a = getSortValue(trackA)
      const b = getSortValue(trackB)

      // If the value at the specified key is undefined, then sort by the title or if this one is undefined, too, sort by the filename
      if (b === undefined || b === null) return -1
      if (a === undefined || a === null) return 1

      if (typeof a === "number" && typeof b === "number") {
        return (a as number) - (b as number)
      }

      if (typeof a === "string" && typeof b === "string") {
        return sortString(a as string, b as string)
      }

      throw new Error(`Invalid sort of a track. \n
        sortBy: ${sortBy}\n
        Values at:\n
        \ta: ${a} \n
        \tb: ${b} \n
        
        Track a: ${trackA.filepath}\n
        Track b: ${trackB.filepath}
        `)
    })

    // The sort was done in ascending order, reverse the array if it should be descending
    return sorted

    // eslint-disable-next-line unicorn/consistent-function-scoping
    function getSortValue(track: Record<string, unknown>) {
      return sortBy === ("title" as ITracksSortKeys) &&
        track[sortBy] === undefined
        ? convertFilepathToFilename((track as ITrack).filepath as FilePath)
        : track[sortBy]
    }
  }
}

/**
 * @param sortBy The key which values get sorted. Only numbers and strings are supported
 */
export function sortByKey<T extends Record<string, unknown>>(
  sortBy: KeyOfConditional<T, string | number> | RANDOM,
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

  return sorted
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

export function moveItemTo<T>(
  array: T[],
  matchFunction: (item: T) => boolean,
  to: number
): Option<T[]> {
  const indexToMove = array.findIndex(matchFunction)

  return moveFrom(indexToMove)(to)(array)
}

/**
 * Pakc an item in an array if it is not one already.
 */
export function packInArrayIfItIsnt<T>(
  item: T
): T extends Array<unknown> ? T : T[] {
  return (
    Array.isArray(item) ? item : ([item] as T extends Array<never> ? T : T[])
  ) as T extends Array<unknown> ? T : T[]
}

/**
 * Removes an element at the provided index, returning undefined if the index is out of bounds.
 *
 * If multiple indexes get provided the array gets filtered with them.
 */
export function removeFromArray(
  indexes: number | readonly number[]
): <T>(array: T[]) => T[] | undefined {
  return (array) =>
    typeof indexes === "number"
      ? pipe(array, deleteAt(indexes), toUndefined)
      : array.filter((_, index) => !indexes.includes(index))
}

/**
 * Move an element from one index to another.

 * @param currentIndex The index which should get moved.
 * @param newIndex The index to insert the new item to.
 * @param array_ The array to modify. 

 * @returns The new array. Does return a new copy. Does not mutate the original array.
 */
export function moveIndexToIndex<T>({
  index,
  moveTo,
  array,
}: {
  index: number
  moveTo: number
  array: readonly T[]
}): readonly T[] | undefined {
  const valueToMove = array[index]

  return pipe(
    array,
    RA.deleteAt(index),
    O.map(RA.insertAt(moveTo, valueToMove)),
    O.flatten,
    O.toUndefined
  )
}

/**
 * Convert seconds to
 */
export function secondsToDuration(seconds: number | undefined | null): string {
  if (seconds === undefined || seconds === null) return ""

  const minutes = Math.floor(seconds / 60)
  const sec = String(Math.round(seconds % 60)).padStart(2, "0")

  return `${minutes}:${sec}`
}

/**
 *
 * @param attributes The attribute as a string or multiple as an array.
 * @returns The string for the data-testattribute element or undefined when undefined was passed.
 */
export function createTestAttribute(
  attributes: string | readonly string[] | undefined
) {
  return Array.isArray(attributes) ? attributes.join(" ") : attributes
}
