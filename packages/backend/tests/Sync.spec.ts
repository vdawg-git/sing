import { getFilesFromDirectory } from "@/Helper"
import { resetMockedPrisma } from "@/lib/__mocks__/CustomPrismaClient"
import createPrismaClient from "@/lib/CustomPrismaClient"
import { syncMusic } from "@/lib/Sync"
import { getRightOrThrow, removeKeys, removeNulledKeys } from "@sing-shared/Pures"
import { ITrack } from "@sing-types/Types"
import { Either, isLeft } from "fp-ts/lib/Either"
import { vol, Volume } from "memfs"
import { beforeEach, describe, expect, it, vi } from "vitest"

import metaDataFactory from "./factories/metaDataFactory"
import rawMetaDataFactory from "./factories/RawMetaDataFactory"
import {
  coversDirectory,
  filesDefault,
  filesDefaultFlat,
  filesUniqueCoversFlat,
  filesUniqueCoversFlatLength,
  musicFolder,
  unusedCoverFilepaths,
  unusedCoversJSON,
} from "./Helper/Consts"
import createMockedEmitter from "./helper/MockedEmitter"

vi.mock("fs/promises")
vi.mock("electron")
vi.mock("@/lib/CustomPrismaClient")
vi.mock("music-metadata")

const prisma = createPrismaClient()

beforeEach(async () => {
  await resetMockedPrisma()
  vol.reset()
  metaDataFactory.rewindSequence()
  rawMetaDataFactory.rewindSequence()
})

it("fs mocking works", async () => {
  const expected = Object.keys(Volume.fromNestedJSON(filesDefault).toJSON())

  vol.fromNestedJSON(filesDefault)

  const result = await getFilesFromDirectory(musicFolder)
  if (isLeft(result)) throw new Error(`${result.left.error}`)
  const files = result.right

  expect(files).toEqual(expected)
})

describe("syncDirectories", async () => {
  it("should add the correct amount of tracks to the DB with nested folders", async () => {
    const expected = metaDataFactory.dbItem().hasID(true).buildList(4)
    const emitter = createMockedEmitter()

    vol.fromNestedJSON(filesDefault)

    await syncMusic(emitter, { coversDirectory, directories: [musicFolder] })

    const queryResult = await prisma.track.findMany()
    const cleanedResult = queryResult.map(removeNulledKeys)

    expect(cleanedResult.length).toEqual(expected.length)
  })

  it("should add the correct tracks to the DB", async () => {
    const expected = metaDataFactory.dbItem().buildList(4)
    const emitter = createMockedEmitter()

    vol.fromNestedJSON(filesDefaultFlat)

    await syncMusic(emitter, { coversDirectory, directories: [musicFolder] })

    const queryResult = await prisma.track.findMany()
    const cleanedResult = queryResult
      .map(removeNulledKeys)
      .map(removeKeys(["id"]))

    expect(cleanedResult).toEqual(expected)
  })

  it("Should return the correct tracks", async () => {
    const expected = metaDataFactory.dbItem().buildList(4)
    vol.fromNestedJSON(filesDefaultFlat)

    const addedDBTracks = getRightOrThrow(
      await syncMusic(emitter, { coversDirectory, directories: [musicFolder] })
    )
      .addedDBTracks.map(removeNulledKeys)
      .map(removeKeys(["id"]))

    expect(addedDBTracks).toEqual(expected)
  })

  it("should remove unused tracks from the database", async () => {
    prisma.track.create({
      data: metaDataFactory.forcedSequence(999).build(),
    })
    prisma.track.create({
      data: metaDataFactory.forcedSequence(9999).build(),
    })

    metaDataFactory.rewindSequence()

    const expected = metaDataFactory.dbItem().buildList(4)
    const emitter = createMockedEmitter()

    vol.fromNestedJSON(filesDefaultFlat)

    await syncMusic(emitter, { coversDirectory, directories: [musicFolder] })

    const queryResult = await prisma.track.findMany()
    const cleanedResult = queryResult
      .map(removeNulledKeys)
      .map(removeKeys(["id"]))

    expect(cleanedResult).toEqual(expected)
  })

  it("should remove unused covers from the filesystem", async () => {
    vol.fromNestedJSON({ ...filesDefaultFlat, ...unusedCoversJSON })
    const emitter = createMockedEmitter()

    await syncMusic(emitter, { coversDirectory, directories: [musicFolder] })

    const worked = Object.keys(vol.toJSON()).every(
      (path) => !unusedCoverFilepaths.includes(path)
    )

    expect(
      worked,
      `Unused covers have not been deleted.\nVol:: ${JSON.stringify(
        vol.toJSON(),
        undefined,
        4
      )}`
    ).toBe(true)
  })

  it("should save the new covers", async () => {
    vol.fromNestedJSON({ ...filesUniqueCoversFlat, ...unusedCoversJSON })
    const emitter = createMockedEmitter()

    await syncMusic(emitter, { coversDirectory, directories: [musicFolder] })

    const coverPaths = Object.keys(vol.toJSON()).filter((path) =>
      path.includes(coversDirectory)
    )

    expect(
      coverPaths,
      `New covers have not added.\nCovers in volume: ${JSON.stringify(
        coverPaths,
        undefined,
        4
      )}\n`
    ).toHaveLength(filesUniqueCoversFlatLength)
  })

  it("should not just return an error with valid data", async () => {
    vol.fromNestedJSON({ ...filesUniqueCoversFlat, ...unusedCoversJSON })
    const emitter = createMockedEmitter()

    await syncMusic(emitter, { coversDirectory, directories: [musicFolder] })

    const emitted = emitter.getEmits()[0] as Either<unknown, unknown>

    expect(isLeft(emitted)).toBe(false)
  })

  it("should not return processing errors with valid data", async () => {
    vol.fromNestedJSON({ ...filesUniqueCoversFlat, ...unusedCoversJSON })
    const emitter = createMockedEmitter()

    await syncMusic(emitter, { coversDirectory, directories: [musicFolder] })

    const emitted = emitter.getEmits()[0] as Either<unknown, unknown>

    const data = getRightOrThrow(emitted) as ITrack[]

    expect(data.coverWriteErrors).lengthOf(0)
    expect(data.deleteCoverError).lengthOf(0)
    expect(data.deleteUnusedTrackError).lengthOf(0)
    expect(data.failedDBTracks).lengthOf(0)
    expect(data.fileReadErrors).lengthOf(0)
    expect(data.folderReadErrors).lengthOf(0)
    expect(data.unsupportedFiles).lengthOf(0)
  })

  it("does not give prisma erros", async () => {
    vol.fromNestedJSON({ ...filesUniqueCoversFlat, ...unusedCoversJSON })
    const emitter = createMockedEmitter()

    await syncMusic(emitter, { coversDirectory, directories: [musicFolder] })

    const emitted = emitter.getEmits()[0] as Either<unknown, unknown>

    if (isLeft(result)) throw result.left.error

    const { failedDBTracks } = result.right

    expect(
      failedDBTracks,
      `Prisma erros:\n${failedDBTracks
        .map((errorObject) => errorObject.error)
        .join("\n")}`
    ).toHaveLength(0)
  })
})

it("fs mocking reset works", async () => {
  const expected = Object.keys(Volume.fromNestedJSON(filesDefault).toJSON())

  vol.fromNestedJSON(filesDefault)

  const result = await getFilesFromDirectory(musicFolder)
  if (isLeft(result)) throw new Error(`${result.left.error}`)
  const files = result.right

  expect(files).toEqual(expected)
})
