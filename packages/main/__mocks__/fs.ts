import { fs } from "memfs"
import { vi } from "vitest"

export const readdirSync = fs.readdirSync
export const existsSync = fs.existsSync
export const rmSync = fs.rmSync
export const accessSync = fs.accessSync
export const copyFile = fs.copyFile
export const copyFileSync = fs.copyFileSync
export const writeFileSync = fs.writeFileSync
export const writeFile = fs.writeFile
export const stat = vi.fn()
export const promises = fs.promises

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
  "git.EXE": "1",
  "git.COM": "1",
}
