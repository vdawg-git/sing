/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  getLeftsRights,
  getLeftValues,
  getRightValues,
  getSupportedMusicFiles,
  getUnsupportedMusicFiles,
  hasCover,
  removeDuplicates,
} from "@/Pures"
import c from "ansicolor"
import { isLeft, left, right } from "fp-ts/lib/Either"
import log from "ololog"
import slash from "slash"

import { deleteFromDirectoryInverted, getFilesFromDirectory } from "../Helper"
import { addTrackToDB, deleteTracksInverted } from "./Crud"
import { convertMetadata, getCover, getRawMetaDataFromFilepath, saveCover } from "./Metadata"

import type {
  IErrorArrayIsEmpty,
  IErrorInvalidArguments,
} from "@sing-types/Types"

import type { IHandlerEmitter } from "@/types/Types"

//? The error rendering functionality is not implemented yet, so there is no need to return the errors (and make the typing more complicated)

// TODO Optimize sync speed - Low priority, now its fast enough
// Get all track filepaths with the file MD5 checksum and filter the new ones to add out if they have the same MD5 checksum
// Then upsert only the ones which already exist, for the rest use one big `createMany` statement
export async function syncMusic(
  handlerEmitter: IHandlerEmitter,
  {
    coversDirectory,
    directories,
  }: {
    coversDirectory: string
    directories: string[]
  }
): Promise<void> {
  log(handlerEmitter.emit)

  if (!Array.isArray(directories)) {
    const error: IErrorInvalidArguments = {
      type: "Invalid arguments",
      message: `Directories to sync must be of type array. Received ${directories}`,
      error: new Error(
        `Directories to sync must be of type array. Received ${directories}`
      ),
    }
    log.red(error)
    handlerEmitter.emit("sendToMain", {
      event: "setMusic",
      data: left(error),
      emitToRenderer: true,
    })
  }
  if (directories.length === 0) {
    const error: IErrorArrayIsEmpty = {
      type: "Array is empty",
      error: new Error("No directories to sync provided"),
      message: "No directories to sync provided.",
    }
    log.red("No directories to sync provided", error)
    handlerEmitter.emit("sendToMain", {
      event: "setMusic",
      data: left(error),
      emitToRenderer: true,
    })
  }
  log("Before first emit")

  handlerEmitter.emit("sendToMain", {
    event: "createNotification",
    data: {
      label: "Started syncing music",
    },
    emitToRenderer: true,
  })
  log("After first emit")

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
  // const { left: coverWriteErrors, right: savedCoverPaths } =
  const { left: coverWriteErrors, right: savedCoverPaths } = getLeftsRights(
    await Promise.all(
      rawMetaData.filter(hasCover).map(getCover(coversDirectory)).map(saveCover)
    )
  )

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

  const addedFilepaths = addedDBTracks.map((track) => track.filepath)

  //* Clean up
  // Remove unused tracks in the database
  const deleteTracksResult = await deleteTracksInverted(addedFilepaths)
  // Remove unused covers
  const deleteCoversResult = await deleteFromDirectoryInverted(
    coversDirectory,
    savedCoverPaths.filter(removeDuplicates)
  )
  const deleteCoverError = isLeft(deleteCoversResult)
    ? [deleteCoversResult.left]
    : deleteCoversResult.right.deletionErrors

  // Emit added tracks and errors as right values
  handlerEmitter.emit("sendToMain", {
    emitToRenderer: true,
    event: "setMusic",
    data: right(addedDBTracks),
  })
}
