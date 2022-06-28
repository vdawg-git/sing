import { beforeEach, describe, expect, it, vi } from "vitest"
import { syncDirectoriesOld } from "@/lib/Sync"

describe("syncDirectories", async () => {
  it("should delete all tracks if it receives an empty array", async () => {})

  it("should add the correct tracks to the DB", async () => {})
})

describe("getMusicFilesFromDir", async () => {
  it("should return the correct files", async () => {})
})

describe("convertMetadata", async () => {}) // convert them for prisma

describe("processCovers", async () => {}) // process the resulting cover data

describe("addToDB", async () => {}) // add the data to the database

describe("getMusicFiles", async () => {}) // get files from the system and filter them out for supported formats. Return filepaths and unsupported formats as error messages
