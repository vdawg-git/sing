import { resolve, dirname } from "path"
import { readdir } from "fs/promises"
import { dialog } from "electron"
import * as fs from "fs"

export async function getFilesFromDir(dir: string): Promise<string[]> {
  const dirents = await readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    dirents.map((dirent) => {
      const res = resolve(dir, dirent.name)
      return dirent.isDirectory() ? getFilesFromDir(res) : res
    })
  )

  return files.flat()
}

export function checkFileExists(path: string) {
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
    .catch((err) => console.error(err))
}

export default function chooseFolders() {
  const paths = dialog.showOpenDialog({
    properties: ["openDirectory", "multiSelections"],
  })

  return paths
}
