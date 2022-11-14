/* eslint-disable @typescript-eslint/no-explicit-any */

import type { ReadonlyNonEmptyArray } from "fp-ts/lib/ReadonlyNonEmptyArray"
import type { ReadonlyDeep, Exact, Merge } from "type-fest"

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
export type InnerArray<T extends readonly unknown[] | unknown[]> =
  T extends (infer U)[] ? (U extends unknown[] ? InnerArray<U> : U) : never

export type RevertEnumerable<T> = T extends unknown[] ? InnerArray<T> : T

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

export type DeepReadonlyNullToUndefined<T> = ReadonlyDeep<NullToUndefined<T>>

export type NullToUndefined<T> = {
  [Key in keyof T]: T[Key] extends object
    ? NullToUndefined<T[Key]>
    : keyof T[Key] extends null
    ? Exclude<T[Key], null> | undefined
    : T[Key]
}

export type OnlyKeysOf<
  U extends Record<string, unknown>,
  T extends Partial<Exact<Record<keyof U, unknown>, T>>
> = T

export type Override<
  U extends Record<string, unknown>,
  T extends Partial<Exact<Record<keyof U, unknown>, T>>
> = Merge<U, T>

export type KeysToTuple<T extends Record<string, unknown>> = {
  [Key in keyof T]: readonly [Key, T[Key]]
}[keyof T]

/**
 * Take a type and filter out its keys which match the condition.
 * @example 
  type x = {
    a: 1
    b: "2"
    c: {}
    d: () => void
  }

  type filtered = AllowedKeyNames<x, string | number>
  // => "a" | "b" 

  @link https://medium.com/dailyjs/typescript-create-a-condition-based-subset-types-9d902cea5b8c
 * 
 */
export type KeyOfConditional<Base, Condition> = {
  [Key in keyof Base]: Base[Key] extends Condition ? Key : never
}[keyof Base]

/**
 * Take a type and create a union type with its array counterpart.
 * The array is readonly.
 */
export type SingleOrNonEmptyArray<T> = T | ReadonlyNonEmptyArray<T>

export type EventHandler<
  T extends Event | MouseEvent = Event,
  A extends Element = HTMLElement
> = (event: T & { currentTarget: EventTarget & A }) => void
