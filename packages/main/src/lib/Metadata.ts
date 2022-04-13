import { Prisma } from "@prisma/client"
import { createHash } from "crypto"
import { app } from "electron"
import * as mm from "music-metadata"
import { join } from "path"
import { checkFileExists, writeFileToDisc } from "../Helper"
import { IPicture } from "music-metadata"

interface ICoverData {
  coverMD5: string
  coverPath: string
  coverBuffer: Buffer
}

export async function getMetaDataFromFilepath(
  filepath: string
): Promise<Prisma.TrackCreateInput> {
  return mm
    .parseFile(filepath)
    .then((data) => convertMetadata(data, filepath))
    .then(({ convertedMetaData, coverData }) => {
      if (coverData) saveCover(coverData)
      return convertedMetaData
    })
}

async function convertMetadata(
  data: mm.IAudioMetadata,
  filepath: string
): Promise<{
  convertedMetaData: Prisma.TrackCreateInput
  coverData?: ICoverData
}> {
  const undesiredProperties = [
    "rating",
    "replaygain_track_gain_ratio",
    "replaygain_track_gain",
    "replaygain_track_peak",
    "replaygain_album_gain",
    "replaygain_album_peak",
    "replaygain_undo",
    "replaygain_track_minmax",
    "trackInfo",
  ]
  // const numberOfKey = ["disk", "track", "movementIndex"]
  let coverData: ICoverData | undefined = undefined
  let convertedMetaData = Object.entries({
    filepath,
    ...data.common,
    ...data.format,
  }).reduce((acc, [key, value]) => {
    if (undesiredProperties.includes(key)) return acc
    if (
      key === "movementIndex" &&
      typeof value === "object" &&
      !("of" in value)
    )
      return acc

    if (typeof value === "object" && "of" in value) {
      if (key === "track") {
        acc["trackNo"] = value.no
        acc["trackNoOf"] = value.of
        return acc
      }
      if (key === "disk") {
        acc["diskNo"] = value.no
        acc["diskNoOf"] = value.of
        return acc
      }
      if (key === "movementIndex") {
        acc["movementIndexNo"] = value.no
        acc["movementIndexNoOf"] = value.of
        return acc
      }
    }
    if (key === "picture" && isIPictureArray(value)) {
      const coverObject = mm.selectCover(value)
      if (!coverObject) return acc

      const { coverMD5, coverPath, coverBuffer } = getCover(coverObject)

      coverData = { coverMD5, coverPath, coverBuffer }

      acc["coverMD5"] = coverMD5
      acc["coverPath"] = coverPath
      return acc
    }

    if (Array.isArray(value)) {
      // @ts-ignore
      acc[key] = JSON.stringify(value)
      return acc
    }

    // @ts-ignore
    acc[key] = value
    return acc
  }, {} as Prisma.TrackCreateInput)

  // delete joinedData.picture // TODO implement cover
  // delete joinedData.rating // TODO implement rating?
  // delete joinedData.replaygain_track_gain_ratio // TODO implement replay gain?
  // delete joinedData.replaygain_track_gain
  // delete joinedData.replaygain_track_peak
  // delete joinedData.replaygain_album_gain
  // delete joinedData.replaygain_album_peak
  // delete joinedData.replaygain_undo
  // delete joinedData.replaygain_track_minmax

  const result =
    coverData !== undefined
      ? { convertedMetaData, coverData }
      : { convertedMetaData }

  return result
}

function getCover(cover: mm.IPicture) {
  const coverMD5 = createHash("md5").update(cover.data).digest("hex")
  const extension = "." + cover.format.split("/").at(-1)
  const coverPath = join(
    app.getPath("userData"),
    "/covers",
    coverMD5 + extension
  )

  return { coverMD5, coverPath, coverBuffer: cover.data }
}

function saveCover(coverData: ICoverData) {
  if (checkFileExists(coverData.coverPath) || !coverData.coverPath) return

  writeFileToDisc(coverData.coverPath, coverData.coverBuffer)
}

export function isIPicture(e: any): e is IPicture {
  if (!Buffer.isBuffer(e?.data)) return false
  if (typeof e?.format !== "string") return false

  return true
}

export function isIPictureArray(a: any): a is IPicture[] {
  if (!Array.isArray(a)) return false
  if (a.length === 0) return false
  const elemtensAreIPicture = a.reduce((acc, e, i, arr) => {
    if (!isIPicture(e)) {
      console.warn(e + " from " + a + " is not an IPicture.")
      arr.splice(1) //break reduce loop
      return false // and return false
    }
    return true
  })
  if (!elemtensAreIPicture) return false

  return true
}
