import { flattenObject, removeDuplicates, removeKeys, stringifyArraysInObject } from "@/Pures"
import { isICoverData } from "@/types/TypeGuards"
import { curry2 } from "fp-ts-std/Function"
import { isRight, left, right } from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/function"
import { parseFile, selectCover } from "music-metadata"
import { createHash } from "node:crypto"

import { checkPathAccessible, writeFileToDisc } from "../Helper"

import type { IAudioMetadata } from "music-metadata"

import type { Prisma } from "@prisma/client"
import type { IError, IRawAudioMetadata } from "@sing-types/Types"
import type { Either } from "fp-ts/lib/Either"
import type { ICoverData } from "@/types/Types"

export async function getRawMetaDataFromFilepath(
  filepath: string
): Promise<Either<IError, IRawAudioMetadata>> {
  return parseFile(filepath)
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
  metaData: IAudioMetadata
): ICoverData | undefined {
  const coverData = selectCover(metaData.common.picture)
  if (!coverData) return undefined

  const coverMD5 = createHash("md5").update(coverData.data).digest("hex")
  const extension = `.${coverData.format.split("/").at(-1)}`
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
  return Promise.all(
    rawData
      .map((data) => getCover(coverFolderPath, data))
      .filter(isICoverData)
      .filter(removeDuplicates)
      .map(async (cover) => {
        const accessible = await checkPathAccessible(cover.coverPath) // If it's accessible it does already exist, so just return the path then

        return isRight(accessible)
          ? right(cover.coverPath)
          : writeFileToDisc(cover.coverBuffer, cover.coverPath)
      })
  )
}
