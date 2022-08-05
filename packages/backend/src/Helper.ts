import { isError } from "@sing-types/Typeguards"
import c from "ansicolor"
import { isLeft, left, right } from "fp-ts/lib/Either"
import { copyFile, mkdir, readdir, stat, unlink, writeFile } from "node:fs/promises"
import path from "node:path"
import log from "ololog"
import slash from "slash"

import { getLeftsRights } from "../../shared/Pures"

import type {
  IErrorFSDeletionFailed,
  IErrorFSDirectoryReadFailed,
  IErrorFSPathUnaccessible,
  IErrorFSWriteFailed,
} from "@sing-types/Types"
import type { Either } from "fp-ts/lib/Either"

export async function getFilesFromDirectory(
  directory: string
): Promise<Either<IErrorFSDirectoryReadFailed, string[]>> {
  try {
    return right(await recursion(directory))
  } catch (error) {
    return left({
      type: "Directory read failed",
      error,
      message: `Error reading out path "${directory}" \n${error}`,
    })
  }
  async function recursion(directoryRecursive: string): Promise<string[]> {
    const dirents = await readdir(directoryRecursive, {
      withFileTypes: true,
    })
    const files = await Promise.all(
      dirents.map((dirent) => {
        const result = path.join(directoryRecursive, dirent.name)
        return dirent.isDirectory() ? recursion(result) : result
      })
    )
    return files.flat().map(slash)
  }
}

export async function checkPathAccessible<T extends string>(
  pathToCheck: T
): Promise<Either<IErrorFSPathUnaccessible, T>> {
  return stat(pathToCheck)
    .then(() => right(pathToCheck))
    .catch((error) => left({ type: "Path not accessible", error }))
}

export async function writeFileToDisc<T extends string>(
  content: string | Buffer,
  filepath: T
): Promise<Either<IErrorFSWriteFailed, T>> {
  return mkdir(path.dirname(filepath), { recursive: true })
    .then(() => writeFile(filepath, content))
    .then(() => right(filepath))
    .catch((error) => {
      console.error(c.red(error))
      const catchedError: IErrorFSWriteFailed = {
        type: "File write failed",
        message: `Error creating writing file:\t"${filepath}"`,
        error,
      }

      return left(catchedError)
    })
}

export async function deleteFromDirectoryInverted(
  directory: string,
  filesNotToDelete: string[]
): Promise<
  Either<
    IErrorFSDirectoryReadFailed,
    { deletedFiles: string[]; deletionErrors: unknown[] }
  >
> {
  const allFiles = await getFilesFromDirectory(directory)

  if (isLeft(allFiles)) return allFiles

  const pathsToDelete = allFiles.right.filter(
    (file) => !filesNotToDelete.includes(file)
  )

  const { left: deletionErrors, right: deletedFiles } = getLeftsRights(
    await deleteFiles(pathsToDelete)
  )

  return right({ deletionErrors, deletedFiles })
}

export async function deleteFiles(
  fileList: string[]
): Promise<Either<IErrorFSDeletionFailed, string>[]> {
  const result = fileList.map((file) =>
    unlink(file)
      .then(() => right(file))
      .catch((error) => {
        const catchedError: IErrorFSDeletionFailed = {
          error,
          type: "File deletion failed" as const,
        }
        return left(catchedError)
      })
  )

  return Promise.all(result)
}

// Check if database exists. If not copy the empty master to make it available
export async function checkDatabase(databasePath: string) {
  const checkAccessible = await checkPathAccessible(databasePath)
  if (isLeft(checkAccessible)) {
    const possibleError = checkAccessible.left.error

    if (
      isError(possibleError) &&
      !possibleError.message.includes("no such file or directory")
    ) {
      log.error.red(possibleError)
    }

    if (import.meta.env.DEV) {
      copyFile(
        path.join(__dirname, "../public/masterDB.db"),
        databasePath
      ).catch(log.error.red)
    } else {
      copyFile(path.join(__dirname, "masterDB.db"), databasePath).catch(
        log.error.red
      )
    }
  }
}
