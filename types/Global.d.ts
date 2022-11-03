/* eslint-disable @typescript-eslint/no-explicit-any */

type IfUnknownOrAny<T, Y, N> = unknown extends T ? Y : N

type ArrayType<T> = IfUnknownOrAny<
  T,
  T[] extends T ? T[] : any[] & T,
  Extract<T, readonly any[]>
>

declare global {
  interface ArrayConstructor {
    isArray<T>(argument: T): argument is ArrayType<T>
  }
}

export {}
