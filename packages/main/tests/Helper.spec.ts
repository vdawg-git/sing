import { vi, test, beforeEach, expect } from "vitest"
import { vol } from "memfs"
import { posix } from "path"
import { deleteFiles, deleteFromDirInverted } from "@/Helper"

vi.mock("fs")

const testdir = "/"
const testFilePaths = ["testfile0.txt", "testfile1.txt", "testfile2.txt"].map(
  (path) => testdir + path
)

const testFiles = {
  [testFilePaths[0]]: "0",
  [testFilePaths[1]]: "1",
  [testFilePaths[2]]: "2",
}

beforeEach(() => {
  vol.reset()
})

test("deleteFromDirInverted", async () => {
  vol.fromJSON(testFiles)

  const dontDelete = [testFilePaths[0], testFilePaths[1]]

  await deleteFromDirInverted(testdir, dontDelete)

  const worked = Object.keys(vol.toJSON()).every(
    (path) => path !== testFilePaths[2]
  )

  expect(
    worked,
    `Did not delete files properly. Should have deleted ${
      testFilePaths[2]
    }. \n Volume: \n ${JSON.stringify(vol.toJSON(), null, 4)}\n`
  ).toBe(true)
})

test("deleteFiles", async () => {
  vol.fromJSON(testFiles)

  const { errors } = await deleteFiles(testFilePaths)

  expect(
    Object.keys(vol.toJSON()),
    `Did not delete files properly. Should have deleted all. \n Errors: \n ${errors.map(
      (_) => _.error + "\n"
    )}`
  ).toHaveLength(0)
})
