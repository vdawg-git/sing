import type { IidBackendAnswer } from "./Types"

export function isError(error: unknown): error is Error {
  return error instanceof Error
}

export function isIDBackendAnswer(
  response: unknown
): response is IidBackendAnswer {
  if (typeof response !== "object" || response === null) return false
  if (typeof (response as IidBackendAnswer)?.id !== "string") return false
  if ((response as IidBackendAnswer)?.data === undefined) return false

  return true
}

// export function isIFrontendEventsConsumeData(data: unknown): data is IFrontendEventsConsume[keyof IFrontendEventsConsume] {
//   if (typeof data !== "object" || data === null) return false
//   if ((data as IFrontendEventsConsume)? !== true) return false
//   if ((data as IFrontendEventsConsume)?.data === undefined) return false
//   if (typeof (data as IFrontendEventsConsume)?.event !== "string") return false

//   return true
// }

// const x = {
//   event: "getTracks",
//   id: "jonoin",
//   args: [],
// }

// isIDEvent(x) //?

//? ##############################################################
//? #######################   TESTS   ############################
//? ##############################################################

// if (import.meta.vitest) {
//   const { expect, test } = await import("vitest")

//   test("isIDEvent happy", () => {
//     const event = {
//       id: "09hg97gh9g9g9vbujuoi",
//       response: { hi: "Hiiii" },
//     }

//     expect(isIDEvent(event)).toBe(true)
//   })

//   test("isIDEvent sad", () => {
//     const event = {
//       id: 3423,
//       data: { hi: "Hiiii" },
//     }

//     expect(isIDEvent(event)).toBe(false)
//   })
// }
