import { syncMusic } from "./Sync"

import type { IOneWayHandlersConsume } from "@sing-types/Types"

export const oneWayHandler: IOneWayHandlersConsume = {
  syncMusic,
}
