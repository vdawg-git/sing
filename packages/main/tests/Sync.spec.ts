import { afterEach, describe, expect, it, vi } from "vitest"
import * as fs from "fs"
import { filesDefault, musicFolder, mockedBase } from "../__mocks__/fs"
import metaDataFactory from "./factories/metaDataFactory"
import rawMetaDataFactory from "./factories/RawMetaDataFactory"
import createPrismaClient from "@/lib/CustomPrismaClient"
import { syncDirs } from "@/lib/Sync"
import { resetMockedPrisma } from "@/lib/__mocks__/CustomPrismaClient"
import { vol, Volume } from "memfs"
import { getFilesFromDir } from "@/Helper"
import { isLeft } from "fp-ts/lib/Either"

vi.mock("fs")
vi.mock("electron")
vi.mock("@/lib/CustomPrismaClient")
vi.mock("music-metadata")

const prisma = createPrismaClient()

it("fs volume read mocking works", async () => {
  const expected = Object.keys(Volume.fromNestedJSON(filesDefault).toJSON())

  vol.fromNestedJSON(filesDefault)

  const result = await getFilesFromDir(musicFolder)
  if (isLeft(result)) throw new Error("" + result.left.error)
  const files = result.right

  expect(files).toEqual(expected)
})

describe("syncDirectories", async () => {
  afterEach(async () => {
    resetMockedPrisma()
    vol.reset()
  })

  it.todo("should add the correct tracks to the DB", async () => {
    const expected = metaDataFactory.buildList(10)
    vol.fromNestedJSON(filesDefault)

    syncDirs([musicFolder])

    expect(await prisma.track.findMany()).toEqual(expected)
  })

  it.todo("should not give errors with correct data", async () => {})

  it.todo("should remove unused tracks from the database", async () => {})

  it.todo("should remove unused covers from the filesystem", async () => {})
})
