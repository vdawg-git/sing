import { fold } from "fp-ts/lib/Either"
import { createHashHistory } from "history"

import { getErrorMessage } from "../../shared/Pures"
import { addNotification } from "./lib/stores/NotificationStore"

import type { ITrack, IError } from "@sing-types/Types"
import type { HistorySource } from "svelte-navigator"
import type AnyObject from "svelte-navigator/types/AnyObject"
import type { Either } from "fp-ts/lib/Either"

export function titleToDisplay(track: ITrack): string {
  if (track?.title) return track.title

  const filename = track.filepath.split("/").at(-1) as string
  const dotIndex = filename?.lastIndexOf(".")
  const title = filename?.slice(0, Math.max(0, dotIndex))

  return title
}

export function displayMetadata(type: keyof ITrack, track: ITrack): string {
  switch (type) {
    case "title":
      return titleToDisplay(track)
    case "duration":
      return secondsToDuration(track.duration)
    default:
      return track[type] ? String(track[type]) : "Unknown"
  }
}

export function isClickOutsideNode(
  event: MouseEvent,
  node: HTMLElement
): boolean {
  if (!event) throw new Error("No event provided")
  if (!node) throw new Error("No node provided")

  if (node.contains(event.target as Node)) return false

  return true
}

export function isSubdirectory(ancestor: string, child: string): boolean {
  const papaDDirectories = ancestor
    .split("/")
    .filter((directory) => directory !== "")
  const childDDirectories = child
    .split("/")
    .filter((directory) => directory !== "")

  return papaDDirectories.every(
    (directory, index) => childDDirectories[index] === directory
  )
}

export function doSideEffectWithEither<A>(
  data: Either<IError, A>,
  onLeftErrorMessage: string,
  onRight: (argument_: A) => void
): void {
  fold((error) => {
    console.error(error)

    const label = `${onLeftErrorMessage}\n${getErrorMessage(
      `Error receiving data`,
      error
    )}`

    addNotification({
      label,
      type: "danger",
      duration: -1,
    })
  }, onRight)(data)
}

// // To be used in the future again, for now lets keep it simple again
// export function truncatePath(path: string, length: number): string {
//   const ellipse = "… "
//   const isUnix = path.at(0) === "/"

//   let parts: string[]
//   if (isUnix) parts = path.split("/").slice(1)
//   else parts = path.split("/")

//   if (parts.length < 1) throw new Error("Invalid path provided")
//   if (parts.length === 1) return path // for paths like /media

//   const toProcess = parts.slice(0, -1)
//   const toProcessLength = toProcess.join("/").length

//   const r = recursive(toProcess, toProcessLength, ellipse)

//   return (isUnix ? "/" : "") + [r, parts.at(-1)].join("/")

//   function recursive(array: string[], length: number, ellipse: string): string {
//     if (array.join("/").length <= length) return array.join("/")

//     const index = array.findIndex((e) => e !== ellipse)

//     if (index !== -1) array[index] = ellipse
//     else return array.join("/")

//     return recursive(array, length, ellipse)
//   }
// }

export function secondsToDuration(seconds: number | undefined | null): string {
  if (seconds === undefined || seconds === null) return ""

  const minutes = Math.floor(seconds / 60)
  const sec = String(Math.round(seconds % 60)).padStart(2, "0")

  return `${minutes}:${sec}`
}

export function createHashSource(): HistorySource {
  const history = createHashHistory()
  let listeners: ((...arguments_: any[]) => unknown)[] = []

  history.listen((location) => {
    if (history.action === "POP") {
      for (const listener of listeners) listener(location)
    }
  })

  return {
    // @ts-ignore
    get location() {
      return history.location
    },
    addEventListener(name: string, handler: (...arguments_: any[]) => unknown) {
      if (name !== "popstate") {
        console.error("Added event which was not listening to popstate")
        return
      }
      listeners.push(handler)
    },
    removeEventListener(
      name: string,
      handler: (...arguments_: any[]) => unknown
    ) {
      if (name !== "popstate") {
        console.error("Added event which was not listening to popstate")
        return
      }
      listeners = listeners.filter((function_) => function_ !== handler)
    },
    history: {
      get state() {
        return history.location.state as object
      },
      pushState(state: AnyObject, _title: string, uri: string) {
        history.push(uri, state)
      },
      replaceState(state: AnyObject, _title: string, uri: string) {
        history.replace(uri, state)
      },
      go(to: number) {
        history.go(to)
      },
    },
  }
}

export function sortAlphabetically(a: ITrack, b: ITrack) {
  const titleA = titleToDisplay(a).toLowerCase()
  const titleB = titleToDisplay(b).toLowerCase()

  return titleA.localeCompare(titleB, undefined, { numeric: true })
}

export function insertIntoArray<T extends never[]>(
  array: T,
  index: number,
  ...newItems: T
) {
  return [...array.slice(0, index), ...newItems, ...array.slice(index)]
}
