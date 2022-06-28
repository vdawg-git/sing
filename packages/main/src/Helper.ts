import { resolve, dirname } from "path"
import { readdir } from "fs/promises"
import { dialog } from "electron"
import * as fs from "fs"
import c from "ansicolor"
import { IErrorable } from "@sing-types/Types"

export async function getFilesFromDir(
  dir: string
): Promise<IErrorable<{ paths: string[] }>> {
  try {
    const dirents = await readdir(dir, { withFileTypes: true })
    const files = await Promise.all(
      dirents.map((dirent) => {
        const res = resolve(dir, dirent.name)
        return dirent.isDirectory() ? getFilesFromDir(res) : res
      })
    )
    return {
      ok: true,
      paths: files.flat() as string[],
    }
  } catch (error) {
    return {
      ok: false,
      error,
    }
  }
}

export function checkPathExists(path: string) {
  let flag = true
  try {
    fs.accessSync(path, fs.constants.F_OK)
  } catch (err) {
    flag = false
  }

  return flag
}

export async function writeFileToDisc(
  filepath: string,
  content: string | Buffer
) {
  return fs.promises
    .mkdir(dirname(filepath), { recursive: true })
    .then(() => fs.promises.writeFile(filepath, content))
    .then(() => ({ ok: true } as const))
    .catch((error) => {
      console.error(c.red(error))
      return { ok: false, error } as const
    })
}

export default function chooseFolders() {
  const paths = dialog.showOpenDialog({
    properties: ["openDirectory", "multiSelections"],
  })

  return paths
}
