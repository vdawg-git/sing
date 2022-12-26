import * as E from "fp-ts/lib/Either"
import slash from "slash"

import { NOTIFICATION_LABEL } from "@sing-renderer/Constants"
import {
  getLeftsRights,
  getLeftValues,
  getRightValues,
  getSupportedMusicFiles,
  getUnsupportedMusicFiles,
  hasCover,
} from "@sing-shared/Pures"

import { deleteFromDirectoryInverted, getFilesFromDirectory } from "../Helper"

import {
  addTrackToDatabase,
  deleteEmptyAlbums,
  deleteEmptyArtists,
  deleteTracksInverted,
  deleteUnusedCoversInDatabase,
  getAlbums,
  getArtists,
  getCovers,
} from "./Crud"
import {
  convertMetadata,
  getCover,
  getRawMetaDataFromFilepath,
  saveCover,
} from "./Metadata"

import type { DirectoryPath, FilePath } from "@sing-types/Filesystem"
import type {
  IError,
  IErrorArrayIsEmpty,
  IErrorInvalidArguments,
} from "@sing-types/Types"
import type { IBackMessagesHandler } from "./Messages"

// TODO use album artist tag for albums and if not present determine best on most occuring seperated artist substring?

//? The error rendering functionality is not implemented yet, so there is no need to return the errors (and make the typing more complicated)

// Optimize sync speed - Low priority, now its fast enough
// Get all track filepaths with the file MD5 checksum and filter the new ones to add out if they have the same MD5 checksum
// Then upsert only the ones which already exist, for the rest use one big `createMany` statement
export async function syncMusic(
  emitter: IBackMessagesHandler,
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

    console.error(error)

    emitter.emit({
      event: "syncedMusic",
      data: E.left(error),
      shouldForwardToRenderer: true,
    } as const)
    return
  }
  if (directories.length === 0) {
    const error: IErrorArrayIsEmpty = {
      type: "Array is empty",
      error: new Error("No directories to sync provided"),
      message: "No directories to sync provided.",
    }

    console.error("No directories to sync provided", error)

    emitter.emit({
      event: "syncedMusic",
      data: E.left(error),
      shouldForwardToRenderer: true,
    })
    return
  }

  emitter.showNotification({
    label: NOTIFICATION_LABEL.syncStarted,
    type: "loading",
    duration: -1,
  })

  console.log("Reading out dirs")

  const directoriesContents = await Promise.all(
    directories
      .map(slash)
      .map((directory) => getFilesFromDirectory(directory as DirectoryPath))
  )

  const folderReadErrors = getLeftValues(directoriesContents)

  if (folderReadErrors.length > 0)
    console.log("folderReadErrors:", folderReadErrors)

  const allFiles = getRightValues(directoriesContents).flat()

  const supportedFiles = getSupportedMusicFiles(allFiles)
  const unsupportedFiles = getUnsupportedMusicFiles(allFiles)

  if (unsupportedFiles.length > 0)
    console.log("unsupportedFiles:", unsupportedFiles)

  const { left: fileReadErrors, right: rawMetaData } = getLeftsRights(
    await Promise.all(supportedFiles.map(getRawMetaDataFromFilepath))
  )

  if (fileReadErrors.length > 0) console.log("fileReadErrors:", fileReadErrors)

  console.log("Getting metadata")

  const metaData = await Promise.all(
    rawMetaData.map(convertMetadata(coversDirectory))
  )

  // Save the covers to the cover folder
  // const { left: coverWriteErrors, right: savedCoverPaths } =
  const { left: coverWriteErrors } = getLeftsRights(
    await Promise.all(
      rawMetaData
        .filter(hasCover)
        .map((data) => data.common.picture)
        .map(getCover(coversDirectory))
        .map(async (coverData) => saveCover(await coverData))
    )
  )

  if (coverWriteErrors.length > 0)
    console.log("coverWriteErrors:", coverWriteErrors)

  console.log("Updating database")

  // Add tracks to the database
  // Use a sync loop for Prisma as it might otherwise throw a timeOutException if it is done asynchronously
  // https://github.com/prisma/prisma/issues/10306
  const addedDBTracks = []
  const failedDBTracks = []
  for (const track of metaData) {
    // It should await each operation to make it non-async
    // eslint-disable-next-line no-await-in-loop
    const result = await addTrackToDatabase(track)
    if (E.isLeft(result)) failedDBTracks.push(result.left)
    else {
      addedDBTracks.push(result.right)
    }
  }

  const addedFilepaths = addedDBTracks.map(({ filepath }) => filepath)

  //* Clean up
  // Remove unused tracks in the database
  for (const deleteResult of [
    await deleteTracksInverted(addedFilepaths),
    await deleteEmptyArtists(),
    await deleteEmptyAlbums(),
    await deleteUnusedCoversInDatabase(),
  ]) {
    if (E.isLeft(deleteResult)) {
      console.error(deleteResult.left)
    }
  }

  const usedCoverFilepaths = (await getCovers(emitter, {
    select: { filepath: true },
  })) as E.Either<IError, readonly { filepath: FilePath }[]>

  if (E.isLeft(usedCoverFilepaths)) {
    console.error("Failed getting covers at Sync:", usedCoverFilepaths.left)
  } else {
    // Remove unused covers
    const deleteCoversFilesystemResult = await deleteFromDirectoryInverted(
      coversDirectory,
      usedCoverFilepaths.right.map(({ filepath }) => filepath)
    )

    if (E.isLeft(deleteCoversFilesystemResult))
      console.error(deleteCoversFilesystemResult.left)
    else if (deleteCoversFilesystemResult.right.deletionErrors.length > 0)
      console.error(deleteCoversFilesystemResult.right.deletionErrors)
  }

  const artists = E.getOrElseW(() => {
    emitter.showAlert({ label: "Failed to get artists" })
    return []
  })(await getArtists(emitter))

  const albums = E.getOrElseW(() => {
    emitter.showAlert({ label: "Failed to get artists" })
    return []
  })(await getAlbums(emitter))

  // Emit added tracks and errors as right values
  emitter.emit({
    event: "syncedMusic",
    data: E.right({
      tracks: addedDBTracks,
      artists,
      albums,
    }),
    shouldForwardToRenderer: true,
  })

  console.log("Finished syncing music")
}
