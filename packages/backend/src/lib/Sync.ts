import {
  getLeftsRights,
  getLeftValues,
  getRightValues,
  getSupportedMusicFiles,
  getUnsupportedMusicFiles,
} from "@/Pures"
import c from "ansicolor"
import { isLeft, left, right } from "fp-ts/lib/Either"
import log from "ololog"
import slash from "slash"

import { deleteFromDirectoryInverted, getFilesFromDirectory } from "../Helper"
import { addTrackToDB, deleteTracksInverted } from "./Crud"
import {
  convertMetadata,
  getRawMetaDataFromFilepath,
  saveCovers,
} from "./Metadata"

import type {
  IErrorArrayIsEmpty,
  IErrorInvalidArguments,
} from "@sing-types/Types"

// TODO Optimize sync speed
// Get all track filepaths with the file MD5 checksum and filter the new ones to add out if they have the same MD5 checksum
// Then upsert only the ones which already exist, for the rest use one big `createMany` statement

export async function syncDirectories(
  coversDirectory: string,
  directories: string[]
) {
  if (!Array.isArray(directories)) {
    const error: IErrorInvalidArguments = {
      type: "Invalid arguments",
      message: `Directories to sync must be of type array. Received ${directories}`,
      error: new Error(
        `Directories to sync must be of type array. Received ${directories}`
      ),
    }
    return left(error)
  }
  if (directories.length === 0) {
    console.error(c.red("No directories to sync provided"))
    const error: IErrorArrayIsEmpty = {
      type: "Array is empty",
      error: new Error("No directories to sync provided"),
      message: "No directories to sync provided.",
    }
    return left(error)
  }

  const directoriesContents = await Promise.all(
    directories.map(slash).map((directory) => getFilesFromDirectory(directory))
  )

  const folderReadErrors = getLeftValues(directoriesContents)
  const allFiles = getRightValues(directoriesContents).flat()

  const supportedFiles = getSupportedMusicFiles(allFiles)
  const unsupportedFiles = getUnsupportedMusicFiles(allFiles)

  const { left: fileReadErrors, right: rawMetaData } = getLeftsRights(
    await Promise.all(supportedFiles.map(getRawMetaDataFromFilepath))
  )

  const metaData = rawMetaData.map(convertMetadata(coversDirectory))

  // Save the covers to the cover folder
  const { left: coverWriteErrors, right: savedCoverPaths } = getLeftsRights(
    await saveCovers(coversDirectory, rawMetaData)
  )

  // Add tracks to the database
  // Use a loop as Prisma time outs randomly otherwise
  const addedDBTracks = []
  const failedDBTracks = []
  for (const track of metaData) {
    // It hsould await each operation, as Prisma might otherwise throw an
    // eslint-disable-next-line no-await-in-loop
    const result = await addTrackToDB(track)
    if (isLeft(result)) failedDBTracks.push(result.left)
    else {
      addedDBTracks.push(result.right)
      log("Added track: ", result.right.title || result.right.filepath)
    }
  }

  const addedFilepaths = addedDBTracks.map((track) => track.filepath)

  //* Clean up
  // Remove unused tracks in the database
  const deleteTracksResult = await deleteTracksInverted(addedFilepaths)
  // Remove unused covers
  const deleteCoversResult = await deleteFromDirectoryInverted(
    coversDirectory,
    savedCoverPaths
  )
  const deleteCoverError = isLeft(deleteCoversResult)
    ? [deleteCoversResult.left]
    : deleteCoversResult.right.deletionErrors

  // Return added tracks and errors as right values
  return right({
    addedDBTracks,
    failedDBTracks,
    folderReadErrors,
    unsupportedFiles,
    fileReadErrors,
    coverWriteErrors,
    deleteCoverError,
    deleteUnusedTrackError: isLeft(deleteTracksResult)
      ? [deleteTracksResult.left]
      : [],
  })
}
