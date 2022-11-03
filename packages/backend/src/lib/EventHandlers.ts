import { syncMusic } from "./Sync"
import { addTracksToPlaylist } from "./Crud"

/**
 * The functions which handle incoming events. The keys are also the event names.
 * Events, unlike queries, do not have a response. Instead if nessecary they transmit data asynchronously through events to the main or renderer thread.
 */
export const backendEventHandlers = Object.freeze({
  syncMusic,
  addTracksToPlaylist,
})
