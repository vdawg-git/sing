import { writable } from "svelte/store"

import type { IPlaylist } from "@sing-types/Types"

export const playlists = writable<readonly IPlaylist[]>([])
