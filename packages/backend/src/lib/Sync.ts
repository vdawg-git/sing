import { NOTIFICATION_LABEL } from "@sing-renderer/Consts"
import {
  getLeftsRights,
  getLeftValues,
  getRightValues,
  getSupportedMusicFiles,
  getUnsupportedMusicFiles,
  hasCover,
  removeDuplicates,
} from "@sing-shared/Pures"
import { getOrElseW, isLeft, left, right } from "fp-ts/lib/Either"
import log from "ololog"
import slash from "slash"

import { deleteFromDirectoryInverted, getFilesFromDirectory } from "../Helper"
import {
  addTrackToDB,
  deleteEmptyAlbums,
  deleteEmptyArtists,
  deleteTracksInverted,
  deleteUnusedCoversInDatabase,
  getAlbums,
  getArtists,
} from "./Crud"
import { convertMetadata, getCover, getRawMetaDataFromFilepath, saveCover } from "./Metadata"

import type {
  IErrorArrayIsEmpty,
  IErrorInvalidArguments,
} from "@sing-types/Types"
import type { IHandlerEmitter } from "@/types/Types"
import type { DirectoryPath } from "@sing-types/Filesystem"

// TODO use album artist tag for albums and if not present determine best on most occuring seperated artist substring?

//? The error rendering functionality is not implemented yet, so there is no need to return the errors (and make the typing more complicated)

// Optimize sync speed - Low priority, now its fast enough
// Get all track filepaths with the file MD5 checksum and filter the new ones to add out if they have the same MD5 checksum
// Then upsert only the ones which already exist, for the rest use one big `createMany` statement
export async function syncMusic(
  toMainEmitter: IHandlerEmitter,
  {
    coversDirectory,
    directories,
  }: {
    coversDirectory: DirectoryPath
    directories: DirectoryPath[]
  }
): Promise<void> {
  if (!Array.isArray(directories)) {
    const error: IErrorInvalidArguments = {
      type: "Invalid arguments",
      message: `Directories to sync must be of type array. Received ${directories}`,
      error: new Error(
        `Directories to sync must be of type array. Received ${directories}`
      ),
    }

    log.error.red(error)

    toMainEmitter.emit("sendToMain", {
      event: "syncedMusic",
      data: left(error),
      forwardToRenderer: true,
    })
    return
  }
  if (directories.length === 0) {
    const error: IErrorArrayIsEmpty = {
      type: "Array is empty",
      error: new Error("No directories to sync provided"),
      message: "No directories to sync provided.",
    }

    log.error.red("No directories to sync provided", error)

    toMainEmitter.emit("sendToMain", {
      event: "syncedMusic",
      data: left(error),
      forwardToRenderer: true,
    })
    return
  }

  toMainEmitter.emit("sendToMain", {
    event: "createNotification",
    data: {
      label: NOTIFICATION_LABEL.syncStarted,
    },
    forwardToRenderer: true,
  })

  log("Reading out dirs")

  const directoriesContents = await Promise.all(
    directories
      .map(slash)
      .map((directory) => getFilesFromDirectory(directory as DirectoryPath))
  )

  const folderReadErrors = getLeftValues(directoriesContents)

  if (folderReadErrors.length > 0) log("folderReadErrors:", folderReadErrors)

  const allFiles = getRightValues(directoriesContents).flat()

  const supportedFiles = getSupportedMusicFiles(allFiles)
  const unsupportedFiles = getUnsupportedMusicFiles(allFiles)

  if (unsupportedFiles.length > 0) log("unsupportedFiles:", unsupportedFiles)

  const { left: fileReadErrors, right: rawMetaData } = getLeftsRights(
    await Promise.all(supportedFiles.map(getRawMetaDataFromFilepath))
  )

  if (fileReadErrors.length > 0) log("fileReadErrors:", fileReadErrors)

  log("Getting metadata")

  const metaData = await Promise.all(
    rawMetaData.map(convertMetadata(coversDirectory))
  )

  // Save the covers to the cover folder
  // const { left: coverWriteErrors, right: savedCoverPaths } =
  const { left: coverWriteErrors, right: savedCoverPaths } = getLeftsRights(
    await Promise.all(
      rawMetaData
        .filter(hasCover)
        .map((data) => data.common.picture)
        .map(getCover(coversDirectory))
        .map(async (coverData) => saveCover(await coverData))
    )
  )

  if (coverWriteErrors.length > 0) log("coverWriteErrors:", coverWriteErrors)

  log("Updating database")

  // Add tracks to the database
  // Use a sync loop for Prisma as it might otherwise throw a timeOutException if it is done in async
  // https://github.com/prisma/prisma/issues/10306
  const addedDBTracks = []
  const failedDBTracks = []
  for (const track of metaData) {
    // It should await each operation to make it non-async
    // eslint-disable-next-line no-await-in-loop
    const result = await addTrackToDB(track)
    if (isLeft(result)) failedDBTracks.push(result.left)
    else {
      addedDBTracks.push(result.right)
    }
  }

  const addedFilepaths = addedDBTracks.map(({ filepath }) => filepath)

  //* Clean up
  // Remove unused tracks in the database
  const deleteTracksResult = await deleteTracksInverted(addedFilepaths)
  const deleteArtistsResult = await deleteEmptyArtists()
  const deleteAlbumsResult = await deleteEmptyAlbums()
  const deleteCoversResult = await deleteUnusedCoversInDatabase()

  if (isLeft(deleteTracksResult)) {
    log.error.red("deleteTracksResult:", deleteTracksResult.left)
    // @ts-ignore
    log.error.red("deleteTracksResult:", deleteTracksResult.left.error.message)
  }
  if (isLeft(deleteArtistsResult))
    log.error.red("deleteArtistsResult:", deleteArtistsResult.left)
  if (isLeft(deleteAlbumsResult))
    log.error.red("deleteAlbumsResult:", deleteAlbumsResult.left)
  if (isLeft(deleteCoversResult))
    log.error.red("deleteCoversResult:", deleteCoversResult.left)

  // Remove unused covers
  const deleteCoversFilesystemResult = await deleteFromDirectoryInverted(
    coversDirectory,
    savedCoverPaths.filter(removeDuplicates)
  )

  if (isLeft(deleteCoversFilesystemResult))
    log.error.red(deleteCoversFilesystemResult.left)
  else if (deleteCoversFilesystemResult.right.deletionErrors.length > 0)
    log.error.red(deleteCoversFilesystemResult.right.deletionErrors)

  const deleteCoverErrors =
    isLeft(deleteCoversResult) && deleteCoversResult.left

  if (deleteCoverErrors) log.error.red("deleteCoverError:", deleteCoverErrors)

  const artists = getOrElseW(() => {
    emitError(toMainEmitter, "Failed to get artists")
    return []
  })(await getArtists())

  const albums = getOrElseW(() => {
    emitError(toMainEmitter, "Failed to get artists")
    return []
  })(await getAlbums())

  // Emit added tracks and errors as right values
  toMainEmitter.emit("sendToMain", {
    forwardToRenderer: true,
    event: "syncedMusic",
    data: right({
      tracks: addedDBTracks,
      artists,
      albums,
    }),
  })

  log("Finished syncing music")
}

function emitError(emitter: IHandlerEmitter, message: string) {
  emitter.emit("sendToMain", {
    event: "createNotification",
    data: { label: message, type: "danger", duration: 5 },
    forwardToRenderer: true,
  })
}
