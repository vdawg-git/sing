import {
  copyFile,
  mkdir,
  readdir,
  stat,
  unlink,
  writeFile,
} from "node:fs/promises"
import path from "node:path"

import c from "ansicolor"
import * as E from "fp-ts/lib/Either"
import log from "ololog"
import slash from "slash"
import { pipe } from "fp-ts/lib/function"
import { omit } from "fp-ts-std/Struct"
import { isDefined } from "ts-is-present"

import type { DirectoryPath, FilePath } from "@sing-types/Filesystem"
import { isError } from "@sing-types/Typeguards"
import type {
  IErrorFSDeletionFailed,
  IErrorFSDirectoryReadFailed,
  IErrorFSPathUnaccessible,
  IErrorFSWriteFailed,
} from "@sing-types/Types"
import type { IPlaylistID, ITrackID } from "@sing-types/Opaque"
import type {
  IPlaylistTrack,
  IPlaylistWithItems,
  IPlaylistWithTracks,
  ITrack,
} from "@sing-types/DatabaseTypes"

import { getLeftsRights, removeDuplicates } from "../../shared/Pures"

import type { Prisma } from "@prisma/client"
import type { Either } from "fp-ts/lib/Either"

export async function getFilesFromDirectory(
  directory: DirectoryPath
): Promise<Either<IErrorFSDirectoryReadFailed, readonly FilePath[]>> {
  try {
    return E.right(await recursion(directory))
  } catch (error) {
    return E.left({
      type: "Directory read failed",

      error,
      message: `Error reading out path "${directory}" \n${error}`,
    })
  }

  async function recursion(
    directoryRecursive: string
  ): Promise<readonly FilePath[]> {
    const dirents = await readdir(directoryRecursive, {
      withFileTypes: true,
    })
    const files = await Promise.all(
      dirents.map((dirent) => {
        const result = path.join(directoryRecursive, dirent.name)
        return dirent.isDirectory() ? recursion(result) : result
      })
    )
    return files.flat().map(slash) as FilePath[]
  }
}

export async function checkPathAccessible<T extends FilePath>(
  pathToCheck: T
): Promise<Either<IErrorFSPathUnaccessible, T>> {
  return stat(pathToCheck)
    .then(() => E.right(pathToCheck))
    .catch((error) => E.left({ type: "Path not accessible", error }))
}

export async function writeFileToDisc<T extends FilePath>(
  content: string | Buffer,
  filepath: T
): Promise<Either<IErrorFSWriteFailed, T>> {
  return mkdir(path.dirname(filepath), { recursive: true })
    .then(() => writeFile(filepath, content))
    .then(() => E.right(filepath))
    .catch((error) => {
      console.error(c.red(error))
      const catchedError: IErrorFSWriteFailed = {
        type: "File write failed",
        message: `Error creating writing file:\t"${filepath}"`,
        error,
      }

      return E.left(catchedError)
    })
}

export async function deleteFromDirectoryInverted(
  directory: DirectoryPath,
  filesNotToDelete: readonly FilePath[]
): Promise<
  Either<
    IErrorFSDirectoryReadFailed,
    { deletedFiles: readonly FilePath[]; deletionErrors: readonly unknown[] }
  >
> {
  const allFiles = await getFilesFromDirectory(directory)

  if (E.isLeft(allFiles)) return allFiles

  const pathsToDelete = allFiles.right.filter(
    (file) => !filesNotToDelete.includes(file)
  )

  const { left: deletionErrors, right: deletedFiles } = getLeftsRights(
    await deleteFiles(pathsToDelete)
  )

  return E.right({ deletionErrors, deletedFiles })
}

export async function deleteFiles(
  fileList: readonly FilePath[]
): Promise<Either<IErrorFSDeletionFailed, FilePath>[]> {
  const result = fileList.map((file) =>
    unlink(file)
      .then(() => E.right(file))
      .catch((error) => {
        const catchedError: IErrorFSDeletionFailed = {
          error,
          type: "File deletion failed" as const,
        }
        return E.left(catchedError)
      })
  )

  return Promise.all(result)
}

/**
 * Check if database exists. If not copy the empty master database over to the user directory to make it available
 */
export async function checkAndCreateDatabase(databasePath: FilePath) {
  const checkAccessible = await checkPathAccessible(databasePath)
  if (E.isLeft(checkAccessible)) {
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

/**
 * Create a default playlist name, like "My playlist #2".
 * @param usedNames The names of playlists already in use.
 * @param iteration Do not set this. This is used internally for the recursion.
 */
export function createDefaultPlaylistName(
  usedNames: readonly string[],
  iteration = 1
): string {
  const name = "My playlist #" + iteration

  if (!usedNames.includes(name)) {
    return name
  }

  return createDefaultPlaylistName(usedNames, iteration + 1)
}

/**
 * Designed to be used with `Array.map`
 * @param playlistID
 * @param indexToStartFrom The position / index where the items should be inserted into the playlist. Defaults to `0`.
 */
export function createPlaylistItem(
  playlistID: IPlaylistID,
  indexToStartFrom = 0
): (
  trackID: ITrackID,
  index: number
) => Prisma.PlaylistItemUncheckedCreateInput {
  return (trackID, index) => ({
    index: indexToStartFrom + index,
    trackID,
    playlistID,
  })
}

export function convertItemsPlaylistToTracksPlaylist(
  playlist: IPlaylistWithItems
): IPlaylistWithTracks {
  const tracks: readonly IPlaylistTrack[] = playlist.items.map((item) => ({
    ...(item.track as ITrack),
    manualOrderIndex: item.index,
  }))

  return pipe({ ...playlist, tracks }, omit(["items"]))
}

export function getPlaylistCoverOfTracks(
  tracks: readonly ITrack[]
): readonly FilePath[] | undefined {
  return tracks
    .map(({ cover }) => cover)
    .filter(isDefined)
    .filter(removeDuplicates)
    .slice(0, 4)
}

export function getCoverUpdatePlaylist(
  oldCovers: readonly FilePath[] | undefined,
  newCovers: readonly FilePath[] | undefined
): {
  connect: Prisma.CoverWhereUniqueInput[] | undefined
  disconnect: Prisma.CoverWhereUniqueInput[] | undefined
} {
  const disconnect = oldCovers
    ?.filter((cover) => !newCovers?.includes(cover))
    .map((filepath) => ({ filepath }))

  const connect = newCovers
    ?.filter((cover) => !oldCovers?.includes(cover))
    .map((filepath) => ({ filepath }))

  return { disconnect, connect }
}
