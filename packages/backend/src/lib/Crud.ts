import { removeNulledKeys, sortByKey, sortTracks, updateKeyValue } from "@sing-shared/Pures"
import { isKeyOfObject } from "@sing-types/Typeguards"
import * as E from "fp-ts/Either"
import * as A from "fp-ts/lib/ReadonlyArray"
import log from "ololog"

import { SQL_STRINGS as S } from "./Consts"
import createPrismaClient from "./CustomPrismaClient"

import type { PrismaPromise, Prisma } from "@prisma/client"
import type {
  IAlbum,
  IError,
  ITrack,
  ICover,
  IArtist,
  IErrorTypes,
  IArtistGetArgument,
  IArtistFindManyArgument,
  IAlbumGetArgument,
  IAlbumFindManyArgument,
  ITrackFindManyArgument,
  ISortOptions,
} from "@sing-types/Types"
import type { Either } from "fp-ts/Either"
import type { FilePath } from "@sing-types/Filesystem"

const prisma = createPrismaClient()

// TODO Update changed covers correctly (now they are getting deleted for whatever reason)

export async function getArtists(
  options?: IArtistFindManyArgument
): Promise<Either<IError, readonly IArtist[]>> {
  const prismaOptions: Prisma.ArtistFindManyArgs = {
    where: options?.where,
    include: {
      albums: {
        include: {
          coverPath: true,
        },
      },
      tracks: true,
    },
  }

  const defaultSort: ISortOptions["artists"] = ["name", "ascending"]

  const response = prisma.artist.findMany(prismaOptions) as PrismaPromise<
    IArtist[]
  >

  return response
    .then(A.map(removeNulledKeys))
    .then(A.map(addArtistImage))
    .then((artists) => sortByKey(options?.sortBy ?? defaultSort, artists))
    .then(E.right)
    .catch(createError("Failed to get from database"))
}

export async function getAlbums(
  options?: IAlbumFindManyArgument
): Promise<Either<IError, readonly IAlbum[]>> {
  const prismaOptions: Prisma.AlbumFindManyArgs = {
    where: options?.where,
    include: { tracks: true },
  }

  const defaultSort: ISortOptions["albums"] = ["name", "ascending"]

  return prisma.album
    .findMany(prismaOptions)
    .then(A.map(removeNulledKeys))
    .then((albums) => sortByKey(options?.sortBy ?? defaultSort, albums))
    .then((albums) => E.right(albums as unknown as IAlbum[]))
    .catch(createError("Failed to remove unused albums from the database"))
}

export async function getTracks(
  options?: ITrackFindManyArgument
): Promise<Either<IError, readonly ITrack[]>> {
  const prismaOptions: Prisma.TrackFindManyArgs = { where: options?.where }

  const defaultSort: ISortOptions["tracks"] = ["title", "ascending"]

  const usedSort: ISortOptions["tracks"] | ["RANDOM"] = options?.isShuffleOn
    ? ["RANDOM"]
    : options?.sortBy ?? defaultSort

  return prisma.track
    .findMany(prismaOptions)
    .then(A.map(removeNulledKeys))
    .then((tracks) => sortTracks(usedSort)(tracks as readonly ITrack[]))
    .then(E.right)
    .catch(createError("Failed to get from database"))
}

export async function getCovers(
  options?: Prisma.CoverFindManyArgs
): Promise<Either<IError, readonly ICover[]>> {
  return prisma.cover
    .findMany(options)
    .then(A.map(removeNulledKeys))
    .then((covers) => E.right(covers as ICover[]))
    .catch(createError("Failed to get from database"))
}

export async function getArtist({
  where,
  sortBy,
  isShuffleOn,
}: IArtistGetArgument): Promise<Either<IError, IArtist>> {
  const include: Prisma.ArtistInclude = {
    albums: {
      include: {
        coverPath: true,
      },
    },
    tracks: true,
  } as const

  const defaultSort: ISortOptions["tracks"] = ["album", "ascending"]

  const usedSort: ISortOptions["tracks"] | ["RANDOM"] = isShuffleOn
    ? ["RANDOM"]
    : sortBy ?? defaultSort

  const rawArtist = prisma.artist.findUniqueOrThrow({
    where,
    include,
  }) as unknown as PrismaPromise<IArtist>

  return rawArtist
    .then((artist) => updateKeyValue("tracks", sortTracks(usedSort), artist))
    .then(removeNulledKeys)
    .then(addArtistImage)
    .then(E.right)
    .catch(createError("Failed to get from database"))
}

export async function getAlbum({
  where,
  isShuffleOn,
  sortBy,
}: IAlbumGetArgument): Promise<Either<IError, IAlbum>> {
  const include: Prisma.AlbumInclude = {
    tracks: true,
  }

  const sort: ISortOptions["tracks"] | ["RANDOM"] = isShuffleOn
    ? ["RANDOM"]
    : sortBy ?? ["trackNo", "ascending"]

  const rawResponse = prisma.album.findUniqueOrThrow({
    where,
    include,
  }) as unknown as PrismaPromise<IAlbum>

  return rawResponse
    .then((album) => updateKeyValue("tracks", sortTracks(sort), album))
    .then(removeNulledKeys)
    .then((album) => E.right(album as IAlbum))
    .catch(createError("Failed to get from database"))
}

export async function addTrackToDB(
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
    .then(removeNulledKeys)
    .then((addedTrack) => E.right(addedTrack as ITrack))
    .catch(createError("Failed to add track to database"))
}

export async function deleteTracksInverted(
  filepaths: readonly FilePath[]
): Promise<Either<IError, number>> {
  const pathsString = filepaths
    .map((path) => path.replace(/'/g, "''")) // Prevent the query from breaking if a value contains single quote(s)
    .map((path) => `'${path}'`)
    .join(",")

  const query = `DELETE FROM 
                  ${S.TRACK} 
                 WHERE 
                  ${S.filepath} NOT IN (${pathsString})`

  return prisma
    .$executeRawUnsafe(query)
    .then((deleteAmount) => E.right(deleteAmount))
    .catch(createError("Failed to remove unused tracks from the database"))
}

export async function deleteEmptyAlbums(): Promise<Either<IError, number>> {
  const query = `
    DELETE FROM
      ${S.ALBUM}
    WHERE
      ${S.name} in (
        SELECT
          ${S["ALBUM.name"]}
        FROM
          ${S.ALBUM}
          LEFT JOIN ${S.TRACK} ON ${S["ALBUM.name"]} = ${S["TRACK.album"]}
        WHERE
          ${S["TRACK.title"]} IS NULL
      )`

  return prisma
    .$executeRawUnsafe(query)
    .then((deleteAmount) => E.right(deleteAmount))
    .catch(createError("Failed to remove unused albums from the database"))
}

export async function deleteEmptyArtists(): Promise<Either<IError, number>> {
  const query = `
    DELETE FROM
      ${S.ARTIST}
    WHERE
      ${S.name} in (
        SELECT
          ${S["ARTIST.name"]}
        FROM
          ${S.ARTIST}
          LEFT JOIN ${S.TRACK} ON ${S["ARTIST.name"]} = ${S["TRACK.artist"]}
        WHERE
          ${S["TRACK.title"]} IS NULL
      )`

  return prisma
    .$executeRawUnsafe(query)
    .then((deleteAmount) => E.right(deleteAmount))
    .catch(createError("Failed to remove unused artists from the database"))
}

export async function deleteUnusedCoversInDatabase(): Promise<
  Either<IError, number>
> {
  const query = `
    DELETE FROM
      ${S.COVER}
    WHERE
      ${S.filepath} in (
        SELECT
          ${S["COVER.filepath"]}
        FROM
          ${S.COVER}
          LEFT JOIN ${S.TRACK} ON ${S["COVER.filepath"]} = ${S["TRACK.cover"]}
        WHERE
          ${S["TRACK.cover"]} IS NULL
      )`

  return prisma
    .$executeRawUnsafe(query)
    .then((deleteAmount) => E.right(deleteAmount))
    .catch(createError("Failed to remove unused covers from the database"))
}

function createError(
  type: IErrorTypes
): (error: unknown) => Either<IError, never> {
  return (error) => {
    if (typeof error !== "object" || error === null)
      return E.left({ type, error })

    if (!isKeyOfObject(error, "message")) return E.left({ type, error })

    log.error.red(type, error)

    return E.left({
      type,
      error: { ...error, message: error.message },
    })
  }
}

function addArtistImage<T extends { albums: readonly { cover?: string }[] }>(
  artist: T
): T {
  // Get the artist image from one of his album covers. Later we will use an API for that
  const image = artist.albums.find(({ cover }) => cover !== undefined)?.cover

  return {
    ...artist,
    image,
  }
}
