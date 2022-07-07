export const mockedBase = "memfs/" as const
export const musicFolder = mockedBase + "music/"
export const coverFolder = mockedBase + "userData/covers/"
export const filesDefault = {
  [musicFolder]: {
    "./dir1/": {
      "./1.mp3": "1",
      "./2.mp3": "2",
    },
    "./3.mp3": " 3",
    "./4.mp3": "4",
  },
} as const
