/* eslint-disable @typescript-eslint/no-explicit-any */

import type { DeepReadonly } from "ts-essentials"

export type AllowedIndexes<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends readonly any[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Result extends any[] = []
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
> = T extends readonly [infer _, ...infer Rest]
  ? AllowedIndexes<Rest, [...Result, Result["length"]]>
  : Result[number]

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

//? https://stackoverflow.com/a/69322301/9578667
// Returns R if T is a function, otherwise returns Fallback
type IsFunction<T, R, Fallback = T> = T extends (...arguments_: any[]) => any
  ? R
  : Fallback

// Returns R if T is an object, otherwise returns Fallback
type IsObject<T, R, Fallback = T> = IsFunction<
  T,
  Fallback,
  T extends object ? R : Fallback
>

// "a.b.c" => "b.c"
type Tail<S> = S extends `${string}.${infer T}` ? Tail<T> : S

// typeof Object.values(T)
type Value<T> = T[keyof T]

// {a: {b: 1, c: 2}} => {"a.b": {b: 1, c: 2}, "a.c": {b: 1, c: 2}}
type FlattenStepOne<T> = {
  [K in keyof T as K extends string
    ? IsObject<T[K], `${K}.${keyof T[K] & string}`, K>
    : K]: IsObject<T[K], { [key in keyof T[K]]: T[K][key] }>
}

// {"a.b": {b: 1, c: 2}, "a.c": {b: 1, c: 2}} => {"a.b": {b: 1}, "a.c": {c: 2}}
type FlattenStepTwo<T> = {
  [a in keyof T]: IsObject<
    T[a],
    Value<{ [M in keyof T[a] as M extends Tail<a> ? M : never]: T[a][M] }>
  >
}

// {a: {b: 1, c: {d: 1}}} => {"a.b": 1, "a.c": {d: 1}}
type FlattenOneLevel<T> = FlattenStepTwo<FlattenStepOne<T>>

// {a: {b: 1, c: {d: 1}}} => {"a.b": 1, "a.b.c.d": 1}
type FlattenWithDots<T> = T extends FlattenOneLevel<T>
  ? T
  : FlattenWithDots<FlattenOneLevel<T>>

type RemoveDots<S> = S extends `${infer H}.${infer C}${infer Rest}`
  ? RemoveDots<`${H}${Uppercase<C>}${Rest}`>
  : S

export type FlattenObject<T extends Record<string, unknown>> = {
  [key in keyof FlattenWithDots<T> as RemoveDots<key>]: FlattenWithDots<T>[key]
}

export type ArraysToString<T extends Record<string, unknown>> = {
  [key in keyof T]: T[key] extends any[]
    ? string
    : T[key] extends Record<string, unknown>
    ? ArraysToString<T[key]>
    : T[key]
}

export type DeepReadonlyNullToUndefined<T> = DeepReadonly<NullToUndefined<T>>

export type NullToUndefined<T> = {
  [Key in keyof T]: T[Key] extends object
    ? NullToUndefined<T[Key]>
    : keyof T[Key] extends null
    ? Exclude<T[Key], null> | undefined
    : T[Key]
}
