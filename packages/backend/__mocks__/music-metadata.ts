import rawMetaDataFactory from "../tests/factories/RawMetaDataFactory"

export { selectCover } from "music-metadata"

export const parseFile = async (filepath: string) => {
  const number = Number(filepath.split("/").at(-1)?.split(".")?.at(0))

  if (Number.isNaN(number) || number === undefined || number === null) {
    throw new Error(
      `Received filepath with invalid testing filename: "${filepath}"\nFor testing purposes filenames should look like this:\n"1.mp3" or "1.unique_cover.mp3"`
    )
  }

  const hasUniqueCover =
    filepath.split("/").at(-1)?.split(".")?.at(1) === "unique_cover"

  return rawMetaDataFactory.build(
    {},
    {
      transient: {
        forcedSequence: number,
        ...(hasUniqueCover && { hasUniqueCover }),
      },
    }
  )
}
