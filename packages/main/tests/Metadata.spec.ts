import { getCover, saveCovers, convertMetadata } from "@/lib/Metadata"
import { isICoverData } from "@/types/TypeGuards"
import { beforeEach, describe, expect, it, vi } from "vitest"
import rawMetaDataFactory from "./factories/RawMetaDataFactory"
import { getExtension, getLeftValues, getRightValues } from "@/Pures"
import metaDataFactory from "./factories/metaDataFactory"

const userDataPath = "T:/test/"
const coversPath = userDataPath + "covers/"

vi.mock("node:fs", async () => (await import("./helper/mockFsManual")).default)

describe("getCover", async () => {
  it("should return cover metadata", async () => {
    const data = rawMetaDataFactory.build()
    const coverData = getCover(userDataPath, data)

    expect(coverData).toBeTruthy()
  })

  it("should return cover metadata with the correct type", async () => {
    const coverData = getCover(userDataPath, rawMetaDataFactory.build())

    expect(isICoverData(coverData)).toBe(true)
  })
})

describe("saveCovers", async () => {
  it("saves the correct amount of covers", async () => {
    const data = [
      ...rawMetaDataFactory.buildList(
        5,
        {},
        { transient: { hasUniqueCover: true } }
      ),
    ]

    const results = getRightValues(await saveCovers(coversPath, data))

    expect(results).lengthOf(1)
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

    const results = getRightValues(await saveCovers(coversPath, data))

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

    const errors = getLeftValues(await saveCovers(coversPath, data))

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

    const result = getRightValues(await saveCovers(coversPath, data))
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
    const expected = metaDataFactory.build()

    const converted = convertMetadata(coversPath)(rawData)

    expect(converted).toStrictEqual(expected)
  })
})
