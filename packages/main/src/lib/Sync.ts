import type { Prisma } from "@prisma/client"
import type { ITrack, IError } from "@sing-types/Types"
import { deleteFromDirInverted, getFilesFromDir } from "../Helper"
import createPrismaClient from "./CustomPrismaClient"
import {
  convertMetadata,
  getRawMetaDataFromFilepath,
  saveCovers,
} from "./Metadata"
import c from "ansicolor"
import {
  getLeftRight,
  getLeftValues,
  getRightValues,
  getSupportedMusicFiles,
  getUnsupportedMusicFiles,
  removeNulledKeys,
} from "@/Pures"
import { Either, isLeft, left, right } from "fp-ts/lib/Either"
import { app } from "electron"

const prisma = createPrismaClient()

export async function syncDirs(directories: string[]) {
  if (directories.length === 0) {
    console.error(c.red("No directories to sync provided"))
    return left({
      error: new Error("No directories to sync provided"),
    })
  }
  const coverFolderPath = app.getPath("userData") + "/covers"

  const directoriesContents = await Promise.all(
    directories.map((dir) => getFilesFromDir(dir))
  )

  const folderReadErrors = getLeftValues(directoriesContents)
  const allFiles = getRightValues(directoriesContents).flat()

  const supportedFiles = getSupportedMusicFiles(allFiles)
  const unsupportedFiles = getUnsupportedMusicFiles(allFiles)

  const { left: fileReadErrors, right: rawMetaData } = getLeftRight(
    await Promise.all(supportedFiles.map(getRawMetaDataFromFilepath))
  )

  const metaData = rawMetaData.map(convertMetadata(coverFolderPath))

  // Save the covers to the cover folder
  const coverWriteErrors = getLeftValues(
    await saveCovers(coverFolderPath, rawMetaData)
  )

  // Add tracks to the database
  const { left: failedDBTracks, right: addedDBTracks } = getLeftRight(
    await Promise.all(metaData.map(async (track) => await addTrackToDB(track))) // Prisma may err with multiple async operations, so await it.
  )

  const addedFilepaths = addedDBTracks.map((track) => track.filepath)

  //* Clean up
  //Remove unused tracks in the database
  const deleteTracksResult = await deleteTracksInverted(addedFilepaths)
  // Remove unused covers
  const deleteCoversResult = await deleteFromDirInverted(
    coverFolderPath,
    addedFilepaths
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

async function addTrackToDB(
  track: Prisma.TrackCreateInput
): Promise<Either<IError, ITrack>> {
  return prisma.track
    .upsert({
      where: {
        filepath: track.filepath,
      },
      update: track,
      create: track,
    })
    .then((track) => right(removeNulledKeys(track)))
    .catch((error) => {
      return left({ error, message: `Failed to add track: ${error.message}` })
    })
}

async function deleteTracksInverted(
  filepaths: string[]
): Promise<Either<IError, number>> {
  return prisma.track
    .deleteMany({
      where: {
        filepath: { notIn: filepaths },
      },
    })
    .then((deleteAmount) => right(deleteAmount.count))
    .catch((error) => {
      console.error(error)
      return left({ error })
    })
}

export function test() {
  return app.getPath("appData")
}
