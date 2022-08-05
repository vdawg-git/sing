import { flattenObject, removeKeys, stringifyArraysInObject } from "@sing-shared/Pures"
import { curry2 } from "fp-ts-std/Function"
import { isRight, left, right } from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/function"
import { parseFile, selectCover } from "music-metadata"
import { createHash } from "node:crypto"

import { checkPathAccessible, writeFileToDisc } from "../Helper"

import type { IPicture } from "music-metadata"

import type { Prisma } from "@prisma/client"
import type {
  IError,
  IErrorMMDParsingError,
  IRawAudioMetadata,
  IRawAudioMetadataWithPicture,
} from "@sing-types/Types"
import type { Either } from "fp-ts/lib/Either"
import type { ICoverData } from "@/types/Types"

export async function getRawMetaDataFromFilepath(
  filepath: string
): Promise<Either<IErrorMMDParsingError, IRawAudioMetadata>> {
  return parseFile(filepath)
    .then((rawMetaData) => right({ ...rawMetaData, filepath }))
    .catch((error) => {
      const catchedError: IErrorMMDParsingError = {
        type: "File metadata parsing failed",
        error,
        message: `${filepath} could not be parsed`,
      }
      return left(catchedError)
    })
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

  const coverData =
    rawMetaData.common.picture !== undefined
      ? getCoverNotCurried(
          coverFolderPath,
          rawMetaData as IRawAudioMetadataWithPicture
        )
      : undefined

  return coverData !== undefined
    ? {
        ...convertedMetaData,
        coverMD5: coverData.coverMD5,
        coverPath: coverData.coverPath,
      }
    : convertedMetaData
}

export const convertMetadata = curry2(convertMetadataNotCurried)

export function getCoverNotCurried(
  coverFolderPath: string,
  coversData: IRawAudioMetadataWithPicture
): ICoverData {
  const coverData = selectCover(coversData.common.picture) as IPicture // cast it since the type ensures that a cover exists

  const coverMD5 = createHash("md5").update(coverData.data).digest("hex")
  const extension = `.${coverData.format.split("/").at(-1)}`
  const coverPath = coverFolderPath + coverMD5 + extension

  return { coverMD5, coverPath, coverBuffer: coverData.data }
}

export const getCover = curry2(getCoverNotCurried)

export async function saveCover({
  coverPath,
  coverBuffer,
}: ICoverData): Promise<Either<IError, string>> {
  const accessible = await checkPathAccessible(coverPath) // If it's accessible it does already exist, so just return the path then

  return isRight(accessible)
    ? right(coverPath)
    : writeFileToDisc(coverBuffer, coverPath)
}
