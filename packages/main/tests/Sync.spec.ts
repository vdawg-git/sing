import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  coverFolder,
  filesDefault,
  filesDefaultFlat,
  filesUniqueCoversFlat,
  filesUniqueCoversFlatLength,
  musicFolder,
  unusedCoverFilepaths,
  unusedCoversJSON,
} from "./Helper/Consts"
import metaDataFactory from "./factories/metaDataFactory"
import rawMetaDataFactory from "./factories/RawMetaDataFactory"
import createPrismaClient from "@/lib/CustomPrismaClient"
import { syncDirs } from "@/lib/Sync"
import { resetMockedPrisma } from "@/lib/__mocks__/CustomPrismaClient"
import { vol, Volume } from "memfs"
import { getFilesFromDir } from "@/Helper"
import { isLeft } from "fp-ts/lib/Either"
import { getRightOrThrow, removeKeys, removeNulledKeys } from "@/Pures"

vi.mock("fs")
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

  const result = await getFilesFromDir(musicFolder)
  if (isLeft(result)) throw new Error("" + result.left.error)
  const files = result.right

  expect(files).toEqual(expected)
})

describe("syncDirectories", async () => {
  it("should add the correct amount of tracks to the DB with nested folders", async () => {
    const expected = metaDataFactory.dbItem().hasID(true).buildList(4)

    vol.fromNestedJSON(filesDefault)

    await syncDirs([musicFolder])

    const result = (await prisma.track.findMany()).map(removeNulledKeys)

    expect(result.length).toEqual(expected.length)
  })

  it("should add the correct tracks to the DB", async () => {
    const expected = metaDataFactory.dbItem().buildList(4)

    vol.fromNestedJSON(filesDefaultFlat)

    await syncDirs([musicFolder])

    const result = (await prisma.track.findMany())
      .map(removeNulledKeys)
      .map(removeKeys(["id"]))

    expect(result).toEqual(expected)
  })

  it("Should return the correct tracks", async () => {
    const expected = metaDataFactory.dbItem().buildList(4)
    vol.fromNestedJSON(filesDefaultFlat)

    const addedDBTracks = getRightOrThrow(await syncDirs([musicFolder]))
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
    vol.fromNestedJSON(filesDefaultFlat)

    await syncDirs([musicFolder])

    const result = (await prisma.track.findMany())
      .map(removeNulledKeys)
      .map(removeKeys(["id"]))

    expect(result).toEqual(expected)
  })

  it("should remove unused covers from the filesystem", async () => {
    vol.fromNestedJSON({ ...filesDefaultFlat, ...unusedCoversJSON })

    await syncDirs([musicFolder])

    const worked = Object.keys(vol.toJSON()).every(
      (path) => !unusedCoverFilepaths.includes(path)
    )

    expect(
      worked,
      `Unused covers have not been deleted.\nVol::\ ${JSON.stringify(
        vol.toJSON(),
        null,
        4
      )}`
    ).toBe(true)
  })

  it("should save the new covers", async () => {
    vol.fromNestedJSON({ ...filesUniqueCoversFlat, ...unusedCoversJSON })

    await syncDirs([musicFolder])

    const coverPaths = Object.keys(vol.toJSON()).filter((path) =>
      path.includes(coverFolder)
    )

    expect(
      coverPaths,
      `New covers have not added.\nCovers in volume:\ ${JSON.stringify(
        coverPaths,
        null,
        4
      )}\n`
    ).toHaveLength(filesUniqueCoversFlatLength)
  })

  it("should not just return an error with valid data", async () => {
    vol.fromNestedJSON({ ...filesUniqueCoversFlat, ...unusedCoversJSON })

    const result = await syncDirs([musicFolder])

    expect(isLeft(result)).toBe(false)
  })

  it("should not return processing errors with valid data", async () => {
    vol.fromNestedJSON({ ...filesUniqueCoversFlat, ...unusedCoversJSON })

    const result = await syncDirs([musicFolder])

    if (isLeft(result)) throw result.left.error.message

    const data = result.right

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

    const result = await syncDirs([musicFolder])

    if (isLeft(result)) throw result.left.error.message

    const { failedDBTracks } = result.right

    expect(
      failedDBTracks,
      `Prisma erros:\n${failedDBTracks.map((err) => err.error).join("\n")}`
    ).toHaveLength(0)
  })
})

it("fs mocking reset works", async () => {
  const expected = Object.keys(Volume.fromNestedJSON(filesDefault).toJSON())

  vol.fromNestedJSON(filesDefault)

  const result = await getFilesFromDir(musicFolder)
  if (isLeft(result)) throw new Error("" + result.left.error)
  const files = result.right

  expect(files).toEqual(expected)
})
