import type { Prisma, Track } from "@prisma/client"
import type * as mm from "music-metadata"
import type { app } from "electron"

// from https://stackoverflow.com/questions/58409603/generate-a-type-where-each-nullable-value-becomes-optional
type NonNull<T> = T extends null ? never : T
export type NullableKeys<T> = NonNullable<
  {
    [K in keyof T]: T[K] extends NonNull<T[K]> ? never : K
  }[keyof T]
>
export type NullValuesToOptional<T> = Omit<T, NullableKeys<T>> &
  Partial<Pick<T, NullableKeys<T>>>

export type ITrack = NullValuesToOptional<Track>

export type IElectronPaths = Parameters<typeof app.getPath>[0]

// https://stackoverflow.com/a/72668664/9578667
export type AllowedIndexes<
  T extends readonly any[],
  Result extends any[] = []
> = T extends readonly [infer _, ...infer Rest]
  ? AllowedIndexes<Rest, [...Result, Result["length"]]>
  : Result[number]

export type IError<T = {}> = {
  readonly error: Error | unknown
  readonly message?: string
} & T

// From Svelte Navigator
export type AnyObject = { [P in number | string | symbol]: any }

// https://stackoverflow.com/a/43001581/9578667
export type Writeable<T> = { -readonly [P in keyof T]: T[P] }

export interface IRawAudioMetadata extends mm.IAudioMetadata {
  filepath: string
}
