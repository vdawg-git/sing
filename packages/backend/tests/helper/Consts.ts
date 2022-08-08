import type { DirectoryJSON } from "memfs"

export const mockBasePath = "/memfs/" as const
export const musicFolder = "/memfs/music/" as const
export const coversDirectory = "/memfs/userData/covers/" as const
export const filesDefault = {
  [musicFolder]: {
    "./dir1/": {
      "./0.mp3": "0",
      "./1.mp3": "1",
    },
    "./2.mp3": " 2",
    "./3.mp3": "3",
  },
} as const

export const filesDefaultFlat = {
  [musicFolder]: {
    "./0.mp3": "0",
    "./1.mp3": "1",
    "./2.mp3": " 2",
    "./3.mp3": "3",
  },
} as const

//? Filenames with the "unique_cover." prepend will get an unique cover
export const filesUniqueCoversFlat = {
  [musicFolder]: {
    "./0.unique_cover.mp3": "0",
    "./1.unique_cover.mp3": "1",
    "./2.unique_cover.mp3": " 2",
    "./3.unique_cover.mp3": "3",
  },
} as const

export const filesUniqueCoversFlatLength = Object.keys(
  filesUniqueCoversFlat[musicFolder]
).length

export const unusedCoverFilepaths = [
  "coverTest1.png",
  "coverTest2.png",
  "coverTest3.png",
].map((fileName) => coversDirectory + fileName)

// eslint-disable-next-line unicorn/no-array-reduce
export const unusedCoversJSON = unusedCoverFilepaths.reduce(
  (accumulator, path, index) => {
    accumulator[path] = index.toString()
    return accumulator
  },
  {} as DirectoryJSON
)
