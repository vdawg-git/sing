import { createFsFromVolume, Volume, fs } from "memfs"

export const readdirSync = fs.readdirSync
export const existsSync = fs.existsSync
export const promises = {
  readdir: fs.promises.readdir,
}

export const mockedBase = "memfs/" as const
export const musicFolder = mockedBase + "music/"
export const coverFolder = mockedBase + "userData/covers/"
export const filesDefault = {
  [musicFolder]: {
    "./dir1/": {
      "./1.mp3": "1",
      "./2.mp3": "2",
      "./3.mp3": " 3",
      "./4.mp3": "4",
      "./5.mp3": "5",
    },
    "./6.mp3": " 6",
    "./7.mp3": " 7",
    "./8.mp3": " 8",
    "./9.mp3": " 9",
    "./10.mp3": "10",
  },
}

// const files = JSON.parse(JSON.stringify(filesDefault)) as typeof filesDefault

// const volume = Volume.fromNestedJSON(files, mockedBase)

// export const mockedMusicFiles = Object.keys(files).map((path) => path.slice(2))

// export const fs = createFsFromVolume(volume)

// export function resetMockFS() {
//   fs.existsSync(musicFolder) // Test that

//   fs.existsSync(musicFolder)
// }
