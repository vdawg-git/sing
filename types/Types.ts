import type { Prisma, Track } from "@prisma/client"

// from https://stackoverflow.com/questions/58409603/generate-a-type-where-each-nullable-value-becomes-optional
type NonNull<T> = T extends null ? never : T
type NullableKeys<T> = NonNullable<
  {
    [K in keyof T]: T[K] extends NonNull<T[K]> ? never : K
  }[keyof T]
>
export type NullValuesToOptional<T> = Omit<T, NullableKeys<T>> &
  Partial<Pick<T, NullableKeys<T>>>

export type IProccessedTrack = IProccessedTrackValid | IProccessedTrackFailed

export interface IProccessedTrackValid {
  readonly ok: true
  readonly track: Track
}
export type IProccessedTrackFailed = {
  track: Prisma.TrackCreateInput
} & IError

export type ITrack = NullValuesToOptional<Track>

export type IElectronPaths =
  | "home"
  | "appData"
  | "userData"
  | "cache"
  | "temp"
  | "exe"
  | "module"
  | "desktop"
  | "documents"
  | "downloads"
  | "music"
  | "pictures"
  | "videos"
  | "recent"
  | "logs"
  | "crashDumps"

// https://stackoverflow.com/a/72668664/9578667
export type AllowedIndexes<
  T extends readonly any[],
  Result extends any[] = []
> = T extends readonly [infer _, ...infer Rest]
  ? AllowedIndexes<Rest, [...Result, Result["length"]]>
  : Result[number]

export interface IError {
  readonly ok: false
  readonly error: Error | unknown
  readonly message?: string
}

export type IErrorable<T extends object> = ISuccess<T> | IError

export type ISuccess<T extends object> = T & { readonly ok: true }

// https://stackoverflow.com/a/63854964/9578667
type None<T> = { [K in keyof T]?: never }
export type EitherOrBoth<T1, T2> = (T1 & None<T2>) | (T2 & None<T1>) | (T1 & T2)

// From Svelte Navigator
export type AnyObject = { [P in number | string | symbol]: any }

const x: IErrorable<{ x: string }> = {
  ok: false as const,
  error: "xx" as const,
} as const

function v(x: IErrorable<object>) {
  if (!x.ok) return x
  else {
    return x
  }
}

const b = v(x)
