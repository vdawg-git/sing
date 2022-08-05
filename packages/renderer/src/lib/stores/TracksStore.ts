import { writable } from "svelte/store"

import type { ITrack } from "@sing-types/Types"

export default writable<readonly ITrack[] | Promise<readonly ITrack[]>>([])
