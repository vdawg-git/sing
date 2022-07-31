/* eslint-disable @typescript-eslint/no-explicit-any */
type NonNull<T> = T extends null ? never : T

export type NullableKeys<T> = NonNullable<
  {
    [K in keyof T]: T[K] extends NonNull<T[K]> ? never : K
  }[keyof T]
>

export type NullValuesToOptional<T> = Omit<T, NullableKeys<T>> &
  Partial<Pick<T, NullableKeys<T>>>

export type AllowedIndexes<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends readonly any[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Result extends any[] = []
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
> = T extends readonly [infer _, ...infer Rest]
  ? AllowedIndexes<Rest, [...Result, Result["length"]]>
  : Result[number]

export type Writeable<T> = { -readonly [P in keyof T]: T[P] }

/**
 * Transfrom `[[[nestedType]]]` to `nestedType`
 * @example type x = [[[[string]]]]
 *     type unnestedX = innerArray<x> //=> `string`
 *
 */
export type InnerArray<T extends unknown[]> = T["length"] extends 1
  ? T[0] extends unknown[]
    ? T[0]["length"] extends 1
      ? InnerArray<T[0]>
      : T[0]
    : T[0]
  : T

export type ParametersFlattened<T extends (...arguments_: any[]) => any> =
  InnerArray<Parameters<T>>

export type DropFirst<T extends any[]> = T extends [any, ...infer U] ? U : never

export type ParametersWithoutFirst<T extends (...arguments_: any[]) => any> =
  DropFirst<Parameters<T>>
