import { flattenObject, removeKeys, stringifyArraysInObject } from "@sing-shared/Pures"
import { curry2 } from "fp-ts-std/Function"
import { isRight, left, right } from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/function"
import { parseFile, selectCover } from "music-metadata"
import { createHash } from "node:crypto"

import { checkPathAccessible, writeFileToDisc } from "../Helper"

import type { StrictExtract, StrictOmit } from "ts-essentials"

import type { IPicture } from "music-metadata"
import type { Prisma } from "@prisma/client"
import type {
  IError,
  IErrorMMDParsingError,
  IRawAudioMetadata,
} from "@sing-types/Types"
import type { Either } from "fp-ts/lib/Either"
import type { ICoverData } from "@/types/Types"
import type { DirectoryPath, FilePath } from "@sing-types/Filesystem"

export async function getRawMetaDataFromFilepath(
  filepath: FilePath
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

async function convertMetadataNotCurried(
  coverFolderPath: DirectoryPath,
  rawMetaData: IRawAudioMetadata
): Promise<Prisma.TrackCreateInput> {
  const undesiredProperties: readonly (
    | keyof IRawAudioMetadata["common"]
    | keyof IRawAudioMetadata["format"]
  )[] = [
    "artists",
    "rating",
    "replaygain_album_gain",
    "replaygain_album_peak",
    "replaygain_track_gain",
    "replaygain_track_gain_ratio",
    "replaygain_track_minmax",
    "replaygain_track_peak",
    "replaygain_undo",
    "trackInfo",
  ]

  const result = await pipe(
    {
      ...rawMetaData.common,
      ...rawMetaData.format,
      filepath: rawMetaData.filepath,
    },
    removeKeys(undesiredProperties),
    // @ts-ignore - flattenObject generic seems to remove the filepath in the type
    flattenObject,
    addRelationFields(coverFolderPath),
    async (x) => stringifyArraysInObject(await x)
  )

  // @ts-ignore Why Typescript, why
  return result
}

export const convertMetadata = curry2(convertMetadataNotCurried)

export async function getCoverNotCurried(
  coverFolderPath: DirectoryPath,
  pictures: readonly IPicture[]
): Promise<ICoverData> {
  const coverData = selectCover(pictures as IPicture[]) as IPicture // cast it since the function argument ensures that a cover exists

  const md5 = createHash("md5").update(coverData.data).digest("hex")
  const extension = `.${coverData.format.split("/").at(-1)}`
  const path = (coverFolderPath + md5 + extension) as FilePath

  return { md5, path, buffer: coverData.data }
}

export const getCover = curry2(getCoverNotCurried)

export async function saveCover({
  path,
  buffer,
}: ICoverData): Promise<Either<IError, FilePath>> {
  const accessible = await checkPathAccessible(path) // If it's accessible it does already exist, so just return the path then

  return isRight(accessible) ? right(path) : writeFileToDisc(buffer, path)
}

type _UsedKeys = StrictExtract<
  keyof Prisma.TrackCreateInput,
  "artistName" | "albumartistName" | "coverPath" | "albumName"
>
type _AllKeys = keyof Prisma.TrackCreateInput
// Use new OnlyKeysOf type for this
type _ValidateTrackKeys<
  T extends Readonly<{
    [K in _AllKeys as K extends _UsedKeys ? K : never]: unknown
  }>
> = T

async function addRelationFieldsNotCurried<
  T extends {
    readonly album?: string
    readonly albumartist?: string
    readonly artist?: string
    readonly picture?: IPicture[]
    readonly filepath: FilePath
  }
>(
  coversDirectory: DirectoryPath,
  rawData: T
): Promise<
  StrictOmit<T, "album" | "albumartist" | "artist" | "picture"> &
    _ValidateTrackKeys<{
      readonly artistName:
        | Prisma.ArtistCreateNestedOneWithoutAlbumsInput
        | undefined
      readonly albumName:
        | Prisma.AlbumCreateNestedOneWithoutTracksInput
        | undefined
      readonly coverPath:
        | Prisma.CoverCreateNestedOneWithoutTracksInput
        | undefined
      readonly albumartistName:
        | Prisma.ArtistCreateNestedOneWithoutAlbumartistTracksInput
        | undefined
    }>
> {
  const { album, albumartist, artist, picture, ...data } = rawData

  const coverData =
    picture !== undefined && picture.length > 0
      ? await getCoverNotCurried(coversDirectory, picture)
      : undefined

  const coverInput: Prisma.CoverCreateNestedOneWithoutTracksInput | undefined =
    coverData
      ? {
          connectOrCreate: {
            where: { md5: coverData.md5 },
            create: {
              md5: coverData.md5,
              filepath: coverData.path,
            },
          },
        }
      : undefined

  const artistInput:
    | Prisma.ArtistCreateNestedOneWithoutAlbumsInput
    | undefined =
    artist !== undefined && artist !== ""
      ? {
          connectOrCreate: {
            where: { name: artist },
            create: { name: artist },
          },
        }
      : undefined

  const albumartistInput:
    | Prisma.ArtistCreateNestedOneWithoutAlbumsInput
    | undefined =
    albumartist !== undefined && albumartist !== ""
      ? {
          connectOrCreate: {
            where: { name: albumartist },
            create: { name: albumartist },
          },
        }
      : undefined

  const albumInput: Prisma.AlbumCreateNestedOneWithoutTracksInput | undefined =
    album !== undefined && album !== ""
      ? {
          connectOrCreate: {
            where: { name: album },
            create: {
              name: album,
              ...(artistInput !== undefined && { artistEntry: artistInput }), // TODO display the most used artist for the album if no album artist is set
              ...(coverInput !== undefined && { coverPath: coverInput }),
            },
          },
        }
      : undefined

  return {
    ...(data as StrictOmit<T, "album" | "albumartist" | "artist" | "picture">),

    artistName: artistInput,

    albumartistName: albumartistInput,

    coverPath: coverInput,

    albumName: albumInput,
  } as const
}

const addRelationFields = curry2(addRelationFieldsNotCurried)
