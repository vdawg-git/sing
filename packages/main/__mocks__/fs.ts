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
