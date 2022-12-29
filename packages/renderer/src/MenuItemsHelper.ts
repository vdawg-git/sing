import { pipe } from "fp-ts/lib/function"
import * as E from "fp-ts/lib/Either"

import {
  addTracksToManualQueueBeginning,
  addTracksToManualQueueEnd,
} from "@/lib/manager/player"

import { displayTrackMetadata, notifiyError } from "./Helper"

import type {
  IPlaylist,
  IPlaylistCreateArgument,
  IMusicIDsUnion,
  IAlbum,
  ITrack,
  IArtist,
} from "@sing-types/DatabaseTypes"
import type {
  ICreateMenuOutOfMusic,
  IMenuItemArgument,
  IMenuItemsArgument,
  IMenuSpacer,
  ISubmenuItemArgument,
} from "./types/Types"

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

// To use type annotation
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

export function convertTrackToPlaylistCreateArgument(
  track: ITrack
): IPlaylistCreateArgument {
  return {
    type: "track",
    name: displayTrackMetadata("title", track),
    id: track.id,
  }
}

export function convertAlbumToPlaylistCreateArgument({
  name,
  id,
}: IAlbum): IPlaylistCreateArgument {
  return { type: "album", name, id }
}

export function convertPlaylistToPlaylistCreateArgument({
  name,
  id,
}: IPlaylist): IPlaylistCreateArgument {
  return { type: "playlist", name, id }
}

export function convertArtistToPlaylistCreateArgument({
  name,
}: IArtist): IPlaylistCreateArgument {
  return { type: "artist", name }
}
