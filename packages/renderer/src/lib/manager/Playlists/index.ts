import { writable } from "svelte/store"

import type { IPlaylist } from "@sing-types/Types"

//! Not implemented yet
export const playlists = writable<readonly IPlaylist[]>([])
