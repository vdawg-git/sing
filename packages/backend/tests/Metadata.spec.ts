import { convertMetadata, getCover, saveCovers } from "@/lib/Metadata"
import { getExtension, getLeftValues, getRightValues, removeNulledKeys } from "@/Pures"
import { isICoverData } from "@/types/TypeGuards"
import { vol } from "memfs"
import { beforeEach, describe, expect, it, vi } from "vitest"

import metaDataFactory from "./factories/MetaDataFactory"
import rawMetaDataFactory from "./factories/RawMetaDataFactory"
import { coverFolder, mockBasePath } from "./helper/Consts"

vi.mock("fs/promises")

beforeEach(async () => {
  vol.reset()
  metaDataFactory.rewindSequence()
  rawMetaDataFactory.rewindSequence()
})

describe("getCover", async () => {
  it("should return cover metadata", async () => {
    const data = rawMetaDataFactory.build()
    const coverData = getCover(mockBasePath, data)

    expect(coverData).toBeTruthy()
  })

  it("should return cover metadata with the correct type", async () => {
    const coverData = getCover(mockBasePath, rawMetaDataFactory.build())

    expect(isICoverData(coverData)).toBe(true)
  })
})

describe("saveCovers", async () => {
  it("saves the correct amount of covers", async () => {
    const uniqueCoversAmounts = 5
    const data = [
      ...rawMetaDataFactory.buildList(
        uniqueCoversAmounts,
        {},
        { transient: { hasUniqueCover: true } }
      ),
    ]

    const results = getRightValues(await saveCovers(coverFolder, data))

    expect(results).lengthOf(uniqueCoversAmounts)
  })

  it("does not save duplicates", async () => {
    const data = [
      ...rawMetaDataFactory.buildList(5),
      ...rawMetaDataFactory.buildList(
        5,
        {},
        { transient: { hasCover: false } }
      ),
    ]

    const results = getRightValues(await saveCovers(coverFolder, data))

    // Should be one because all covers are using the same hash in the factory and thus only one should get created
    expect(results).lengthOf(1)
  })

  it("gives no errors", async () => {
    const data = [
      ...rawMetaDataFactory.buildList(5),
      ...rawMetaDataFactory.buildList(
        5,
        {},
        { transient: { hasCover: false } }
      ),
    ]

    const errors = getLeftValues(await saveCovers(coverFolder, data))

    expect(errors).lengthOf(0)
  })

  it("saves images", async () => {
    const data = [
      ...rawMetaDataFactory.buildList(5),
      ...rawMetaDataFactory.buildList(
        5,
        {},
        { transient: { hasCover: false } }
      ),
    ]

    const result = getRightValues(await saveCovers(coverFolder, data))
      .map(getExtension)
      .every((x) => x === "png")

    expect(result).toBe(true)
  })
})

describe("convertMetadata", async () => {
  beforeEach(async () => {
    rawMetaDataFactory.rewindSequence()
    metaDataFactory.rewindSequence()
  })

  it("should give the correct metadata", async () => {
    const rawData = rawMetaDataFactory.build()
    const expected = removeNulledKeys(metaDataFactory.build())

    const converted = removeNulledKeys(convertMetadata(coverFolder)(rawData))

    expect(converted).toStrictEqual(expected)
  })
})
