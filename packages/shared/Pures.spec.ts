import * as E from "fp-ts/lib/Either"
import { expect, test } from "vitest"

import {
  filterPathsByExtenstions,
  removeKeys,
  stringifyArraysInObject,
  flattenObject,
  objectsKeysInArrayToObject,
  getLeftsRights,
  removeDuplicates,
  removeNulledKeys,
  getRightOrThrow,
  moveIndexToIndex,
  secondsToDuration,
} from "./Pures"

import type { FilePath } from "../../types/Filesystem"
import type { Either } from "fp-ts/lib/Either"

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

test("moveIndexToIndex happy", () => {
  const given = [1, 2, 3, 4]

  const expected = [4, 1, 2, 3]

  expect(moveIndexToIndex({ array: given, index: 3, moveTo: 0 })).toEqual(
    expected
  )
})

test("moveIndexToIndex sad", () => {
  const given = [1, 2, 3, 4]

  const expected = undefined

  expect(moveIndexToIndex({ array: given, index: 99, moveTo: 1 })).toEqual(
    expected
  )
})

test("secondsToDuration", async () => {
  const seconds = 124.007_865_767_96
  const desiredResult = "2:04"

  expect(secondsToDuration(seconds)).toEqual(desiredResult)
})
