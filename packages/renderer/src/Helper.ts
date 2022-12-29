import { pipe } from "fp-ts/lib/function"
import * as E from "fp-ts/lib/Either"
import * as O from "fp-ts/Option"
import * as RA from "fp-ts/ReadonlyArray"
import { createHashHistory } from "history"
import { isDefined } from "ts-is-present"

import {
  convertFilepathToFilename,
  getErrorMessage,
  packInArrayIfItIsnt,
} from "../../shared/Pures"

import { addNotification } from "./lib/stores/NotificationStore"
import { createAlbumURI, createArtistURI, ROUTES } from "./Routes"
import { playNewSource } from "./lib/manager/player"
import { createAddToPlaylistAndQueueMenuItems } from "./MenuItemsHelper"

import type { IError } from "@sing-types/Types"
import type {
  ITrack,
  IPlaylistCreateArgument,
  IPlaylist,
  IAlbum,
} from "@sing-types/DatabaseTypes"
import type { HistorySource, NavigateFn } from "svelte-navigator"
import type AnyObject from "svelte-navigator/types/AnyObject"
import type { ICardProperties } from "./types/Types"

export function titleToDisplay(track: ITrack): string {
  if (track?.title) return track.title

  return convertFilepathToFilename(track.filepath)
}

export function displayTrackMetadata(
  type: keyof ITrack,
  track: ITrack
): string {
  switch (type) {
    case "title": {
      return titleToDisplay(track)
    }
    case "duration": {
      return secondsToDuration(track.duration)
    }
    default: {
      return track[type] ? String(track[type]) : "Unknown"
    }
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
  const papaDirectories = ancestor
    .split("/")
    .filter((directory) => directory !== "")
  const childDDirectories = child
    .split("/")
    .filter((directory) => directory !== "")

  return papaDirectories.every(
    (directory, index) => childDDirectories[index] === directory
  )
}

export function isOverflowingX(element: HTMLElement): boolean {
  return element.scrollWidth > element.clientWidth
}

export function getFontSize(element: HTMLElement): number {
  const stringedNumber = element.style.fontSize.replace("px", "")

  return Number(stringedNumber)
}

export function setFontSize(element: HTMLElement, size: number) {
  // eslint-disable-next-line no-param-reassign
  element.style.fontSize = `${size}px`
}

/**
 * To be used with the `use:` directive on an element with text
 */
export function doTextResizeToFitElement(
  element: HTMLElement,
  {
    minSize,
    maxSize,
    step,
  }: {
    minSize: number
    maxSize: number
    step: number
  }
): SvelteActionReturnType {
  let isFirtstExecution = true
  let screenResizeTimeout: NodeJS.Timeout
  let lastScreensize = document.body.clientWidth

  startResizingFont()

  window.addEventListener("resize", startResizingFont)

  return {
    destroy: () => window.removeEventListener("resize", startResizingFont),
  }

  function startResizingFont() {
    if (isFirtstExecution) {
      resizeFont()
      isFirtstExecution = false
      return
    }

    // Start the resize after a timeout to prevent spamming the function when the user resizes the screen
    clearTimeout(screenResizeTimeout) // And cancel it everytime he resizes within the timeout
    screenResizeTimeout = setTimeout(resizeFont, 900) // Then start it again

    // Returns the fontSize index to be used
    function resizeFont(): void {
      const currentScreensize = document.body.clientWidth

      if (!isFirtstExecution && currentScreensize === lastScreensize) return // no need to resize again

      // Start with the min size and scale it up
      setFontSize(element, minSize)

      // if it starts overflowing, stop the scaling and go back back one step
      let size = minSize

      while (!isOverflowingX(element) && size <= maxSize) {
        size += step

        setFontSize(element, size)
      }

      setFontSize(element, size - step)

      lastScreensize = currentScreensize
    }
  }
}

export async function createAndNavigateToPlaylist(
  navigate: (to: string) => void,
  options?: IPlaylistCreateArgument
) {
  pipe(
    await window.api.createPlaylist(options),
    E.foldW(
      notifiyError("Failed to create playlist"),

      (playlist) => {
        navigate(`/${ROUTES.playlists}/${playlist.id}`)
      }
    )
  )
}

export function notifiyError(
  message: string
): (error: IError | unknown) => Promise<void> {
  return async (error) => {
    console.error(error)
    addNotification({
      type: "danger",
      label: getErrorMessage(message, error),
    })
  }
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

export function moveElementFromToIndex<T>(
  currentIndex: number,
  newIndex: number,
  array_: readonly T[]
): readonly T[] | undefined {
  const valueToMove = array_[currentIndex]
  return pipe(
    array_,
    RA.deleteAt(currentIndex),
    O.map(RA.insertAt(newIndex, valueToMove)),
    O.flatten,
    // eslint-disable-next-line unicorn/no-useless-undefined
    O.toUndefined
  )
}

/**
 * Check if the user clicked outside of the element and runs the provided callback if he did.
 */
export function useOnOutClick(
  node: HTMLElement,
  { callback, extraElements, stopPropagation, condition }: IUseOutClickParameter
) {
  document.addEventListener("click", onClick, true)

  return {
    destroy: () => {
      document.removeEventListener("click", onClick, true)
    },
  }

  function onClick(event: MouseEvent) {
    if (!!condition && !condition()) return

    const extraElementsFiltered = packInArrayIfItIsnt(
      typeof extraElements === "function" ? extraElements() : extraElements
    ).filter(isDefined) as HTMLElement[] // Typescript does not like the filtering here

    if (
      ![...extraElementsFiltered, node].every((element) =>
        isClickOutsideNode(event, element)
      )
    ) {
      return
    }

    if (stopPropagation === true) {
      event.stopPropagation()
    }

    callback(event)
  }
}

type IUseOutClickParameter = {
  /**
   * Callback to run when the user clicked outside of the element.
   */
  callback: (event: MouseEvent) => void
  /**
   * Elements which are treated as "inside click" elements.
   *
   * Can also receive a function to get them.
   */
  extraElements?:
    | HTMLElement
    | (HTMLElement | undefined)[]
    | (() => HTMLElement | HTMLElement[] | undefined)
  /**
   * If the propagation of the outClick should be stopped. False by default.
   */
  stopPropagation?: boolean
  /**
   * A condition if to run the callback
   */
  condition?: () => boolean
}

export function convertAlbumToCardData({
  navigate,
  $playlistsStore,
}: {
  navigate: NavigateFn
  $playlistsStore: readonly IPlaylist[]
}): (album: IAlbum) => ICardProperties {
  return ({ name, cover, id, artist }: IAlbum) => ({
    title: name,
    image: cover,
    secondaryText: artist,
    onPlay: () =>
      playNewSource({
        sourceID: id,
        source: "album",
        sortBy: ["trackNo", "ascending"],
      }),
    onClickPrimary: () => navigate(createAlbumURI(id)),
    onClickSecondary: () => navigate(createArtistURI(artist)),
    contextMenuItems: createAddToPlaylistAndQueueMenuItems($playlistsStore)({
      type: "album",
      name,
      id,
    }),
  })
}

function preventDefault(event: { preventDefault: () => void }) {
  event.preventDefault()
}

function disableAllScrolling() {
  document.addEventListener("wheel", preventDefault, {
    passive: false,
  })
}

function enableAllScrolling() {
  document.removeEventListener("wheel", preventDefault)
}

/**
 * To be used with the use: directive.
 *
 * Disable all scrolling when element enters the viewport.
 * Re-enables it when it gets destroyed.
 */
export function useDisableScrolling(_: Element) {
  disableAllScrolling()

  return {
    destroy: enableAllScrolling,
  }
}
