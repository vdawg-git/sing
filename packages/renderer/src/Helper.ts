import { createHashHistory, type HashHistoryOptions } from "history"
import type { HistorySource } from "svelte-navigator"
import type AnyObject from "svelte-navigator/types/AnyObject"

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
  const papaDirs = ancestor.split("/").filter((dir) => dir !== "")
  const childDirs = child.split("/").filter((dir) => dir !== "")

  return papaDirs.every((dir, i) => childDirs[i] === dir)
}

export function setAttributesOnElement(
  node: HTMLElement,
  attributes: { name: string; value: string }[]
) {
  update(attributes)

  return { update }

  function update(attributes: { name: string; value: string }[]) {
    for (const { name, value } of attributes) {
      node.setAttribute(name, value)
    }
  }
}

// To be used in the future again, for now lets keep it simple again
export function truncatePath(path: string, length: number): string {
  const ellipse = "… "
  const isUnix = path.at(0) === "/"

  let parts: string[]
  if (isUnix) parts = path.split("/").slice(1)
  else parts = path.split("/")

  if (parts.length < 1) throw new Error("Invalid path provided")
  if (parts.length === 1) return path // for paths like /media

  const toProcess = parts.slice(0, -1)
  const toProcessLength = toProcess.join("/").length

  const r = recursive(toProcess, toProcessLength, ellipse)

  return (isUnix ? "/" : "") + [r, parts.at(-1)].join("/")

  function recursive(array: string[], length: number, ellipse: string): string {
    if (array.join("/").length <= length) return array.join("/")

    const index = array.findIndex((e) => e !== ellipse)

    if (index !== -1) array[index] = ellipse
    else return array.join("/")

    return recursive(array, length, ellipse)
  }
}

export function secondsToDuration(seconds: number | undefined | null): string {
  if (seconds === undefined || seconds === null) return ""

  const minutes = Math.floor(seconds / 60)
  const sec = String(Math.round(seconds % 60)).padStart(2, "0")

  return minutes + ":" + sec
}

export function createHashSource(): HistorySource {
  const history = createHashHistory()
  let listeners: Function[] = []

  history.listen((location) => {
    if (history.action === "POP") {
      listeners.forEach((listener) => listener(location))
    }
  })

  return {
    //@ts-ignore
    get location() {
      return history.location
    },
    addEventListener(name: string, handler: Function) {
      if (name !== "popstate") {
        console.error("Added event which was not listening to popstate")
        return
      }
      listeners.push(handler)
    },
    removeEventListener(name: string, handler: Function) {
      if (name !== "popstate") {
        console.error("Added event which was not listening to popstate")
        return
      }
      listeners = listeners.filter((fn) => fn !== handler)
    },
    history: {
      get state() {
        return history.location.state
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
