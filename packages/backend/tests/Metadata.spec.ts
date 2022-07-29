import { convertMetadata, getCover, getCoverNotCurried, saveCover } from "@/lib/Metadata"
import { getExtension, getLeftValues, getRightValues, hasCover, removeNulledKeys } from "@/Pures"
import { isICoverData } from "@/types/TypeGuards"
import { flow, pipe } from "fp-ts/lib/function"
import * as A from "fp-ts/lib/ReadonlyArray"
import { vol } from "memfs"
import { beforeEach, describe, expect, it, vi } from "vitest"

import metaDataFactory from "./factories/MetaDataFactory"
import rawMetaDataFactory from "./factories/RawMetaDataFactory"
import { coverFolder, mockBasePath } from "./helper/Consts"

import type { IRawAudioMetadataWithPicture } from "@sing-types/Types"

vi.mock("fs/promises")

beforeEach(async () => {
  vol.reset()
  metaDataFactory.rewindSequence()
  rawMetaDataFactory.rewindSequence()
})

describe("getCover", async () => {
  it("should return cover metadata", async () => {
    const data = rawMetaDataFactory.build()
    const coverData = getCoverNotCurried(
      mockBasePath,
      data as IRawAudioMetadataWithPicture
    )

    expect(coverData).toBeTruthy()
  })

  it("should return cover metadata with the correct type", async () => {
    const coverData = getCoverNotCurried(
      mockBasePath,
      rawMetaDataFactory.build() as IRawAudioMetadataWithPicture
    )

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
    ] as IRawAudioMetadataWithPicture[]

    const results = getRightValues(
      await Promise.all(data.map(getCover(coverFolder)).map(saveCover))
    )

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
    ] as IRawAudioMetadataWithPicture[]

    await Promise.all(
      data.filter(hasCover).map(getCover(coverFolder)).map(saveCover)
    )

    const result = Object.keys(vol.toJSON())

    // Should be one because all covers are using the same hash in the factory and thus only one should get created
    expect(
      result,
      `Result has duplicates:\n ${JSON.stringify(result, undefined, 4)}`
    ).lengthOf(1)
  })

  it("gives no errors", async () => {
    const data = [
      ...rawMetaDataFactory.buildList(5),
      ...rawMetaDataFactory.buildList(
        5,
        {},
        { transient: { hasCover: false } }
      ),
    ] as IRawAudioMetadataWithPicture[]

    const errors = getLeftValues(
      await Promise.all(
        data.filter(hasCover).map(getCover(coverFolder)).map(saveCover)
      )
    )

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
    const result = getRightValues(
      await Promise.all(
        pipe(
          data,
          A.filter(hasCover),
          A.map(flow(getCover(coverFolder), saveCover))
        )
      )
    )
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
