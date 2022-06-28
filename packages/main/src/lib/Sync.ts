import type { Track as ITrack } from "@prisma/client"
import { checkPathExists, getFilesFromDir } from "../Helper"
import createPrismaClient from "./CustomPrismaClient"
import { getMetaDataFromFilepath } from "./Metadata"
import type {
  IProccessedTrack,
  IProccessedTrackFailed,
  IProccessedTrackValid,
  IError,
  EitherOrBoth,
  IErrorable,
} from "@sing-types/Types"
import {
  SUPPORTED_MUSIC_FORMATS,
  UNSUPPORTED_MUSIC_FORMATS,
} from "./FileFormats"
import c from "ansicolor"
import * as R from "ramda"
import {
  filterPathsByExtenstions,
  getExtension,
  includedInArray,
  isFileSupported,
} from "@/Pures"

const prisma = createPrismaClient()

interface IRetrievedTrackPathSuccess {
  ok: true
  path: string
}

interface IRetrievedTrackPathError {
  ok: false
  path: string
  error: Error
}

type IRetrievedTrackPath = IRetrievedTrackPathSuccess | IRetrievedTrackPathError

export async function syncDirs(directories: string[]): Promise<void> {
  if (directories.length === 0) {
    console.error(c.red("No directories to sync provided"))
    // TODO: remove all tracks
  }

  const folders = await Promise.all(
    directories.map(async (dir) => await getFilesFromDir(dir))
  )

  const folderErrors = folders.filter((x) => !x.ok)
  const foldersSuccess = folders.filter((x) => x.ok)

  // const supported = foldersContent
  //   .filter(isMusicFolder)
  //   .map((folder) => folder.supported)
  // const unsupported = foldersContent
  //   .filter(isMusicFolder)
  //   .map((folder) => folder.unsupported)
  // const readErrors = foldersContent.filter(hasError)

  // const rawMetaDataFolders = await Promise.all(supported.map(getMetaData))
  // const metaDataFolders = rawMetaDataFolders.map(convertMetadata)

  // for (const dir of directories) {
  //   if (!checkPathExists(dir)) {
  //     console.error(c.red("Cannot access directory. Does it exist?"))
  //     continue
  //   }

  //   const { supported, unsupported } = await getMusicFilesFromDir(dir)

  //   const { metaData, covers } = await processRawMetadata(supported)

  //   const failedCovers = await processCovers(covers) // TODO

  //   const { added, error } = await addToDB(metaData)
}
// await cleanUp()
// }

function isMusicFolder(obj: object): obj is IRetrievedTrackPath {
  return obj.hasOwnProperty("supported") || obj.hasOwnProperty("unsupported")
}

export async function getMusicFilesFromDir(
  supportedExtensions: readonly string[],
  directory: string
): Promise<IRetrievedTrackPath[] | IError> {
  //Todo Move the side-effect to the top and process the data from there. This keeps all the small sub-functions pure and error handling is easier

  const retrievedTrackPaths = files
    .map((x) => x.path)
    .map((x: string) => createRetrivedMusicPath(supportedExtensions, x))

  return retrievedTrackPaths
}

function createRetrivedMusicPath(
  supported: readonly string[],
  path: string
): IRetrievedTrackPath {
  const isSupported = isFileSupported(supported, path)

  if (isSupported) {
    return {
      ok: true,
      path,
    }
  } else {
    return {
      ok: false,
      path,
      error: new Error(`Filetype ".${getExtension(path)}" is not supported`),
    }
  }
}

/* #################################################################################################
################################################################ OLD CODE #################################
#################################################################################################*/

export async function syncDirectoriesOld(directories: string[]) {
  if (!directories) {
    console.error("No folders to sync from are passed")

    deleteNonExistentTracksOld([]) // delete all tracks, basically just here to be able to reset the tracks for testing purposes
    return { added: [] }
  }

  const unresolvedDirs: Promise<IProccessedTrack[]>[] = []

  for (const folder of directories) {
    console.log(`Adding ${folder}`)
    if (!checkPathExists(folder)) {
      console.error(`Failed to add folder: ${folder}. Does it exist?`)
      continue
    }
    unresolvedDirs.push(addDirectoryOld(folder))
  }

  const tracks = (await Promise.all(unresolvedDirs)).flat()

  const added = tracks
    .filter((d) => d.ok === true)
    .map((validTrack) => validTrack.track) as ITrack[]

  const failed = tracks.filter(
    (d) => d.ok === false
  ) as IProccessedTrackFailed[]

  if (failed.length > 0) {
    console.group(`Failed to add tracks:`)
    console.error("################################")
    failed
      .map((track) => {
        return { error: track.error, path: track.track.filepath }
      })
      .forEach((track) => console.dir(track))

    console.error("################################")
    console.groupEnd()
  }

  deleteNonExistentTracksOld(added)

  return { added, failed }
}

async function addDirectoryOld(dir: string): Promise<IProccessedTrack[]> {
  const filepaths = (await getFilesFromDir(dir)).filter((path) =>
    SUPPORTED_MUSIC_FORMATS.some((format) => path.endsWith(format))
  )
  const result: IProccessedTrack[] = []

  for (const filepath of filepaths) {
    result.push(await addTrackOld(filepath))
  }
  // const result = Promise.all(filepaths.map((filepath) => addTrack(filepath)))

  return result
}

async function addTrackOld(filepath: string): Promise<IProccessedTrack> {
  const data = await getMetaDataFromFilepath(filepath)

  return prisma.track
    .upsert({
      where: {
        filepath: data.filepath,
      },
      update: data,
      create: data,
    })
    .then((track) => {
      return { ok: true, track } as IProccessedTrackValid
    })
    .catch((error) => {
      return {
        ok: false,
        track: data,
        error,
      } as IProccessedTrackFailed
    })
}

async function deleteNonExistentTracksOld(tracks: ITrack[]) {
  const paths = tracks.map((track) => track.filepath)

  prisma.track
    .deleteMany({
      where: {
        filepath: { notIn: paths },
      },
    })
    .catch((err) => console.error(err))
}
