import { pipe } from "fp-ts/Function"
import * as E from "fp-ts/lib/Either"
import * as O from "fp-ts/Option"
import * as RA from "fp-ts/ReadonlyArray"
import { createHashHistory } from "history"
import { isDefined } from "ts-is-present"

import {
  addTracksToManualQueueBeginning,
  addTracksToManualQueueEnd,
} from "@/lib/manager/player"

import { convertFilepathToFilename, getErrorMessage } from "../../shared/Pures"

import { addNotification } from "./lib/stores/NotificationStore"
import { ROUTES } from "./Consts"

import type { IError } from "@sing-types/Types"
import type {
  ITrack,
  IPlaylist,
  IPlaylistCreateArgument,
  IMusicIDsUnion,
} from "@sing-types/DatabaseTypes"
import type { HistorySource } from "svelte-navigator"
import type AnyObject from "svelte-navigator/types/AnyObject"
import type {
  ICreateMenuOutOfMusic,
  IMenuItemArgument,
  IMenuItemsArgument,
  IMenuSpacer,
  ISubmenuItemArgument,
} from "./types/Types"

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
 * Check if the user clicked outside of the element.
 * It creates a function to be used with the `use:` element directive.
 *
 * @param callback The callback to run when the user clicks out of the element.
 * @param extraElements The extra elements which get treated as "inside click" elements.
 * @param stopPropagation If the propagation of the outClick should be stopped. False by default.
 * @return The function to be used with the `use` directive
 */
export function createOnOutClick(
  callback: (event: MouseEvent) => void,
  options?: {
    stopPropagation?: boolean
    extraElements?: (HTMLElement | undefined)[]
  }
): (node: HTMLElement) => void {
  return (node: HTMLElement) => {
    function listener(event: MouseEvent) {
      const extraElementsFiltered =
        options?.extraElements?.filter(isDefined) || []

      if (
        ![...extraElementsFiltered, node].some((element) =>
          isClickOutsideNode(event, element)
        )
      ) {
        return
      }

      if (options?.stopPropagation === true) {
        event.stopPropagation()
      }

      callback(event)
    }

    document.addEventListener("click", listener, true)

    return {
      destroy: () => {
        document.removeEventListener("click", listener, true)
      },
    }
  }
}

function createAddToPlaylistMenuItems(
  playlists: readonly IPlaylist[]
): ICreateMenuOutOfMusic {
  return (musicToAdd) => {
    const addToNewPlaylist: IMenuItemArgument = {
      label: "Create playlist",
      async onClick() {
        window.api.createPlaylist(musicToAdd)
      },
      type: "item",
    }

    const playlistSubMenu: ISubmenuItemArgument = {
      type: "subMenu",
      label: "Add to playlist",
      subMenu: [
        { type: "spacer" },
        addToNewPlaylist,
        { type: "spacer" },
        ...playlists.flatMap((playlist) =>
          // Create the add to playlist options, but do not allow adding a playlist to itself.
          musicToAdd.type === "playlist" && musicToAdd.id === playlist.id
            ? []
            : ({
                label: playlist.name,
                onClick: () =>
                  window.api.addToPlaylist({ playlist, musicToAdd }),
                type: "item",
              } as const)
        ),
      ],
    }

    return [playlistSubMenu]
  }
}

// eslint-disable-next-line func-style
const createAddToQueueMenuItems: ICreateMenuOutOfMusic = (
  musicToAdd: IMusicIDsUnion
) => {
  const queueSubMenu: readonly (IMenuItemArgument | IMenuSpacer)[] = [
    {
      type: "item",
      label: "Play next",
      async onClick() {
        pipe(
          await window.api.getTracksFromMusic(musicToAdd),

          E.matchW(
            notifiyError("Failed to add to play next"),

            addTracksToManualQueueBeginning
          )
        )
      },
    },
    {
      type: "item",
      label: "Play later",
      async onClick() {
        pipe(
          await window.api.getTracksFromMusic(musicToAdd),

          E.matchW(
            notifiyError("Failed to add to play later"),

            addTracksToManualQueueEnd
          )
        )
      },
    },
  ]
  return queueSubMenu
}

function createAddToPlaylistAndQueueMenuItemsBase(
  musicToAdd: IPlaylistCreateArgument,
  playlists: readonly IPlaylist[]
): IMenuItemsArgument {
  return [
    ...createAddToQueueMenuItems(musicToAdd),
    ...createAddToPlaylistMenuItems(playlists)(musicToAdd),
  ]
}

export function createAddToPlaylistAndQueueMenuItems(
  playlists: readonly IPlaylist[]
): ICreateMenuOutOfMusic {
  return (item) => createAddToPlaylistAndQueueMenuItemsBase(item, playlists)
}
