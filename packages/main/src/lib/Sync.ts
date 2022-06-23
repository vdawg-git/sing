import type { Track as ITrack } from "@prisma/client"
import { checkFileExists, getFilesFromDir } from "../Helper"
import createPrismaClient from "./CustomPrismaClient"
import { getMetaDataFromFilepath } from "./Metadata"
import userSettingsStore from "./UserSettings"
import {
  IProccessedTrack,
  IProccessedTrackFailed,
  IProccessedTrackValid,
} from "../../../../types/Types"
import { SUPPORTED_MUSIC_FORMATS } from "./FileFormats"

const prisma = createPrismaClient()

export async function syncDirectories(directories: string[]) {
  if (!directories) {
    console.error(
      "No folders to sync from are saved in the user settings store"
    )

    deleteNonExistentTracks([]) // delete all tracks, basically just here to be able to reset the tracks for testing purposes
    return { added: [] }
  }

  const unresolvedDirs: Promise<IProccessedTrack[]>[] = []

  for (const folder of directories) {
    console.log(`Adding ${folder}`)
    if (!checkFileExists(folder)) {
      console.error(`Failed to add folder: ${folder}. Does it exist?`)
      continue
    }
    unresolvedDirs.push(addDirectory(folder))
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

  deleteNonExistentTracks(added)

  return { added, failed }
}

async function addDirectory(dir: string): Promise<IProccessedTrack[]> {
  const filepaths = (await getFilesFromDir(dir)).filter((path) =>
    SUPPORTED_MUSIC_FORMATS.some((format) => path.endsWith(format))
  )
  const result: IProccessedTrack[] = []

  for (const filepath of filepaths) {
    result.push(await addTrack(filepath))
  }
  // const result = Promise.all(filepaths.map((filepath) => addTrack(filepath)))

  return result
}

async function addTrack(filepath: string): Promise<IProccessedTrack> {
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

async function deleteNonExistentTracks(tracks: ITrack[]) {
  const paths = tracks.map((track) => track.filepath)

  prisma.track
    .deleteMany({
      where: {
        filepath: { notIn: paths },
      },
    })
    .catch((err) => console.error(err))
}
