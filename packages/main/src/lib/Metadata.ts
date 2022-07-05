import { Prisma } from "@prisma/client"
import { createHash } from "crypto"
import * as mm from "music-metadata"
import { writeFileToDisc } from "../Helper"
import { Either } from "fp-ts/lib/Either"
import { IError, IRawAudioMetadata } from "@sing-types/Types"
import { pipe } from "fp-ts/lib/function"
import {
  removeKeys,
  flattenObject,
  stringifyArraysInObject,
  removeDuplicates,
} from "@/Pures"
import { left, right } from "fp-ts/lib/Either"
import { curry2 } from "fp-ts-std/Function"
import type { ICoverData } from "@/types/Types"
import { isICoverData } from "@/types/TypeGuards"
import { existsSync } from "fs"

export async function getRawMetaDataFromFilepath(
  filepath: string
): Promise<Either<IError, IRawAudioMetadata>> {
  return mm
    .parseFile(filepath)
    .then((rawMetaData) => right({ ...rawMetaData, filepath }))
    .catch((error) =>
      left({
        error,
        message: `Error accessing file ${filepath}. Does it exist?`,
      })
    )
}

function convertMetadataNotCurried(
  coverFolderPath: string,
  rawMetaData: IRawAudioMetadata
): Prisma.TrackCreateInput {
  const undesiredProperties: readonly (
    | keyof IRawAudioMetadata["common"]
    | keyof IRawAudioMetadata["format"]
  )[] = [
    "rating",
    "replaygain_track_gain_ratio",
    "replaygain_track_gain",
    "replaygain_track_peak",
    "replaygain_album_gain",
    "replaygain_album_peak",
    "replaygain_undo",
    "replaygain_track_minmax",
    "trackInfo",
    "picture",
  ]

  const convertedMetaData = pipe(
    {
      ...rawMetaData.common,
      ...rawMetaData.format,
      filepath: rawMetaData.filepath,
    },
    removeKeys(undesiredProperties),
    flattenObject,
    stringifyArraysInObject
  ) as Prisma.TrackCreateInput

  const coverData = getCover(coverFolderPath, rawMetaData)

  return coverData !== null && coverData !== undefined
    ? {
        ...convertedMetaData,
        coverMD5: coverData.coverMD5,
        coverPath: coverData.coverPath,
      }
    : convertedMetaData
}

export const convertMetadata = curry2(convertMetadataNotCurried)

export function getCover(
  coverFolderPath: string,
  metaData: mm.IAudioMetadata
): ICoverData | undefined {
  const coverData = mm.selectCover(metaData.common.picture)
  if (!coverData) return undefined

  const coverMD5 = createHash("md5").update(coverData.data).digest("hex")
  const extension = "." + coverData.format.split("/").at(-1)
  const coverPath = coverFolderPath + coverMD5 + extension

  return { coverMD5, coverPath, coverBuffer: coverData.data }
}

/**
 *
 * @param coverFolderPath The path to the cover folder within the user data directory. (Should be retrieved by `electron.getPath`)
 * @param rawData The unconverted metadata
 * @returns All the cover filepaths passed to it as `string[]`
 */
export async function saveCovers(
  coverFolderPath: string,
  rawData: IRawAudioMetadata[]
): Promise<Either<IError, string>[]> {
  return await Promise.all(
    rawData
      .map((data) => getCover(coverFolderPath, data))
      .filter(isICoverData)
      .filter(removeDuplicates)
      .map((cover) => {
        return existsSync(cover.coverPath)
          ? right(cover.coverPath)
          : writeFileToDisc(cover.coverBuffer, cover.coverPath)
      })
  )
}
