import { IErrorable, ISuccess, IError } from "@sing-types/Types"
import { boolean } from "fp-ts-std"
import * as R from "ramda"

export function filterPathsByExtenstions(
  extensions: readonly string[],
  paths: readonly string[]
): string[] {
  return R.pipe(
    R.map(getExtension),
    R.filter(includedInArray(extensions))
  )(paths)
}

export function getExtension(string: string): string {
  return R.pipe(R.split("."), R.last, R.toLower)(string)
}

function includedInArrayNotCurried(
  arr: readonly unknown[],
  value: unknown
): boolean {
  return arr.includes(value)
}
export const includedInArray = R.curry(includedInArrayNotCurried)

export function isFileSupported(
  supportedExtensions: readonly string[],
  filePath: string
): boolean {
  return R.pipe(getExtension, (x) => includedInArray(supportedExtensions)(x))(
    filePath
  )
}
