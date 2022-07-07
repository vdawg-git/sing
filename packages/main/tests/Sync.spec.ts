debugger

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { filesDefault, musicFolder } from "./Helper/Consts"
import metaDataFactory from "./factories/metaDataFactory"
import rawMetaDataFactory from "./factories/RawMetaDataFactory"
import createPrismaClient from "@/lib/CustomPrismaClient"
import { syncDirs } from "@/lib/Sync"
import { resetMockedPrisma } from "@/lib/__mocks__/CustomPrismaClient"
import { vol, Volume } from "memfs"
import { getFilesFromDir } from "@/Helper"
import { isLeft } from "fp-ts/lib/Either"
import { getRightOrThrow, removeNulledKeys } from "@/Pures"

vi.mock("fs")
vi.mock("electron")
vi.mock("@/lib/CustomPrismaClient")
vi.mock("music-metadata")

const prisma = createPrismaClient()

it("fs mocking works", async () => {
  const expected = Object.keys(Volume.fromNestedJSON({}).toJSON())

  vol.fromNestedJSON({})

  const result = await getFilesFromDir("musicFolder")
  if (isLeft(result)) throw new Error("" + result.left.error)
  const files = result.right

  expect(files).toEqual(expected)
})

// describe("syncDirectories", async () => {
//   beforeEach(async () => {
//     resetMockedPrisma()
//     vol.reset()
//     metaDataFactory.rewindSequence()
//     rawMetaDataFactory.rewindSequence()
//   })

//   it.todo("should add the correct amount of tracks to the DB", async () => {
//     const expected = metaDataFactory.dbItem().buildList(4)

//     vol.fromNestedJSON(filesDefault)

//     await syncDirs([musicFolder])

//     const result = await prisma.track.findMany()
//     // .map(removeNulledKeys)

//     expect(result.length).toEqual(expected.length)
//   })

//   it.todo("should add the correct tracks to the DB", async () => {
//     const expected = metaDataFactory.dbItem().buildList(4)

//     vol.fromNestedJSON(filesDefault)

//     await syncDirs([musicFolder])

//     const result = await prisma.track.findMany()
//     // .map(removeNulledKeys)

//     expect(result).toEqual(expected)
//   })

//   it("Should return the correct tracks", async () => {
//     const expected = metaDataFactory.buildList(4)
//     vol.fromNestedJSON(filesDefault)

//     const addedDBTracks = getRightOrThrow(
//       await syncDirs([musicFolder])
//     ).addedDBTracks.map(removeNulledKeys)

//     expect(addedDBTracks).toEqual(expected)
//   })

//   it.todo("should not give errors with correct data", async () => {})

//   it.todo("should remove unused tracks from the database", async () => {})

//   it.todo("should remove unused covers from the filesystem", async () => {})
// })

// it("fs mocking reset works", async () => {
//   const expected = Object.keys(Volume.fromNestedJSON(filesDefault).toJSON())

//   vol.fromNestedJSON(filesDefault)

//   const result = await getFilesFromDir(musicFolder)
//   if (isLeft(result)) throw new Error("" + result.left.error)
//   const files = result.right

//   expect(files).toEqual(expected)
// })
