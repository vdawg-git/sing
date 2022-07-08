import { fs } from "memfs"
import { vi } from "vitest"

export const readdirSync = fs.readdirSync
export const existsSync = fs.existsSync

export const accessSync = fs.accessSync
export const constants = fs.constants
export const copyFile = fs.copyFile
export const copyFileSync = fs.copyFileSync
export const writeFileSync = fs.writeFileSync
export const writeFile = fs.writeFile
export const promises = fs.promises
