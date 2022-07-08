import { posix, dirname } from "path"
import { dialog } from "electron"
import { rmSync, constants, accessSync, promises } from "fs"
import c from "ansicolor"
import { Either, right, left, isLeft } from "fp-ts/lib/Either"
import { IError } from "@sing-types/Types"

export async function getFilesFromDir(
  dir: string
): Promise<Either<IError, string[]>> {
  async function recursion(dir: string): Promise<string[]> {
    const dirents = await promises.readdir(dir, { withFileTypes: true })
    const files = await Promise.all(
      dirents.map((dirent) => {
        const res = posix.resolve(dir, dirent.name)
        return dirent.isDirectory() ? recursion(res) : res
      })
    )
    return files.flat()
  }
  try {
    return right(await recursion(dir))
  } catch (error) {
    return left({
      error,
      message: `Error reading out path "${dir}" \n${error}`,
    })
  }
}

export function checkPathAccessible<T extends string>(
  path: T
): Either<IError, T> {
  try {
    accessSync(path, constants.F_OK)
    return right(path)
  } catch (error) {
    console.error(`Error accessing "${path}"`)

    return left({
      message: `Error accessing path "${path}"`,
      error,
    })
  }
}

export async function writeFileToDisc<T extends string>(
  content: string | Buffer,
  filepath: T
): Promise<Either<IError, T>> {
  return promises
    .mkdir(dirname(filepath), { recursive: true })
    .then(() => promises.writeFile(filepath, content))
    .then(() => right(filepath))
    .catch((error) => {
      console.error(c.red(error))
      return left({
        message: `Error creating writing file:\t"${filepath}"`,
        error,
      } as const)
    })
}

export async function deleteFromDirInverted(
  directory: string,
  filesNotToDelete: string[]
): Promise<
  Either<IError, { deletedFiles: string[]; deletionErrors: unknown[] }>
> {
  const allFiles = await getFilesFromDir(directory)
  if (isLeft(allFiles)) return allFiles

  const pathsToDelete = allFiles.right.filter(
    (file) => !filesNotToDelete.includes(file)
  )

  const { errors: deletionErrors, deletedFiles } = await deleteFiles(
    pathsToDelete
  )

  return right({ deletionErrors, deletedFiles })
}

export async function deleteFiles(fileList: string[]): Promise<{
  errors: IError[]
  deletedFiles: string[]
}> {
  const errors: IError[] = []
  const deletedFiles: string[] = []

  for (const path of fileList) {
    try {
      await promises.unlink(path)
      deletedFiles.push(path)
    } catch (error) {
      errors.push({ error })
    }
  }
  return { errors, deletedFiles }
}

export default function chooseFolders() {
  const paths = dialog.showOpenDialog({
    properties: ["openDirectory", "multiSelections"],
  })

  return paths
}
