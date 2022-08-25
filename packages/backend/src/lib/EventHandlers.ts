import { syncMusic } from "./Sync"

import type { IEventHandlersConsume } from "@sing-types/IPC"

export const eventHandlers: IEventHandlersConsume = Object.freeze({
  syncMusic,
})
