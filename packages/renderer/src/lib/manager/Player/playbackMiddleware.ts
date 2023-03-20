import type { Dispatch, MiddlewareAPI } from "@reduxjs/toolkit"

export function myCustomMiddleware(api: MiddlewareAPI<Dispatch>) {
  console.log({ api })
  return (next: Dispatch) => (newAction: MiddlewareAPI<Dispatch>) => {
    console.log({ newAction })
    // @ts-expect-error
    next(newAction)
  }
  //   if (plabth.actions.increment.match(action)) {
  // `action` is narrowed down to the type `PayloadAction<number>` here.
  //   }
}
