import { curry2 } from "fp-ts-std/Function"
import { pipe } from "fp-ts/lib/function"
import * as E from "fp-ts/lib/Either"
import { parseFile, selectCover } from "music-metadata"

import {
  flattenObject,
  removeKeys,
  stringifyArraysInObject,
} from "@sing-shared/Pures"
import { UNKNOWN_ALBUM, UNKNOWN_ARTIST } from "@sing-shared/Consts"

import {
  checkPathAccessible,
  createCoverPath,
  createMD5,
  writeFileToDisc,
} from "../Helper"

import type {
  IError,
  IErrorMMDParsingError,
  IRawAudioMetadata,
} from "@sing-types/Types"
import type { DirectoryPath, FilePath } from "@sing-types/Filesystem"
import type { ICoverData } from "@/types/Types"
import type { StrictExtract, StrictOmit } from "ts-essentials"
import type { IPicture } from "music-metadata"
import type { Prisma } from "@sing-prisma"
import type { Either } from "fp-ts/lib/Either"

export async function getRawMetaDataFromFilepath(
  filepath: FilePath
): Promise<Either<IErrorMMDParsingError, IRawAudioMetadata>> {
  return parseFile(filepath)
    .then((rawMetaData) => E.right({ ...rawMetaData, filepath }))
    .catch((error) => {
      const catchedError: IErrorMMDParsingError = {
        type: "File metadata parsing failed",
        error,
        message: `${filepath} could not be parsed`,
      }
      return E.left(catchedError)
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

  const md5 = createMD5(coverData.data)
  const extension = coverData.format.split("/").at(-1) as string
  const path = createCoverPath(coverFolderPath, md5, extension)

  return { md5, path, buffer: coverData.data }
}

export const getCover = curry2(getCoverNotCurried)

export async function saveCover({
  path,
  buffer,
}: ICoverData): Promise<Either<IError, FilePath>> {
  const accessible = await checkPathAccessible(path) // If it's accessible it does already exist, so just return the path then

  return E.isRight(accessible) ? E.right(path) : writeFileToDisc(buffer, path)
}

type _UsedKeys = StrictExtract<
  keyof Prisma.TrackCreateInput,
  "artistEntry" | "albumartistEntry" | "coverEntry" | "albumEntry"
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
      readonly artistEntry:
        | Prisma.ArtistCreateNestedOneWithoutAlbumsInput
        | undefined
      readonly albumEntry:
        | Prisma.AlbumCreateNestedOneWithoutTracksInput
        | undefined
      readonly coverEntry:
        | Prisma.CoverCreateNestedOneWithoutTracksInput
        | undefined
      readonly albumartistEntry:
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

  /**
   * If no artist is found in the metadata, `UNKNOWN_ARTIST` will be used.
   * Thus `artist` is always set in the database.
   */
  const artistInput: Prisma.ArtistCreateNestedOneWithoutAlbumsInput =
    artist !== undefined || artist === ""
      ? {
          connectOrCreate: {
            where: { name: artist },
            create: { name: artist },
          },
        }
      : {
          connectOrCreate: {
            where: { name: UNKNOWN_ARTIST },
            create: { name: UNKNOWN_ARTIST },
          },
        }

  /**
   * Can be undefined, thus `null` in the database.
   */
  const albumartistInput:
    | Prisma.ArtistCreateNestedOneWithoutAlbumsInput
    | undefined =
    albumartist === undefined || albumartist === ""
      ? undefined
      : {
          connectOrCreate: {
            where: { name: albumartist },
            create: { name: albumartist },
          },
        }

  const albumInput: Prisma.AlbumCreateNestedOneWithoutTracksInput =
    album !== undefined && album !== ""
      ? {
          connectOrCreate: {
            where: {
              name_artist: {
                name: album,
                artist: (albumartist || artist) ?? UNKNOWN_ARTIST,
              },
            },
            create: {
              name: album,
              artistEntry: albumartistInput || artistInput,
              ...(coverInput !== undefined && { coverEntry: coverInput }),
            },
          },
        }
      : {
          connectOrCreate: {
            where: {
              name_artist: {
                name: UNKNOWN_ALBUM,
                artist: artist ?? UNKNOWN_ARTIST,
              },
            },
            create: {
              name: UNKNOWN_ALBUM,
              artistEntry: artistInput,

              ...(coverInput !== undefined && { coverEntry: coverInput }),
            },
          },
        }

  return {
    ...(data as StrictOmit<T, "album" | "albumartist" | "artist" | "picture">),

    artistEntry: artistInput,

    albumartistEntry: albumartistInput,

    coverEntry: coverInput,

    albumEntry: albumInput,
  } as const
}

const addRelationFields = curry2(addRelationFieldsNotCurried)
