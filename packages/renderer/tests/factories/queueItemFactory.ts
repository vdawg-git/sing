import type { IQueueItem } from "@/types/Types"
import { Factory } from "fishery"
import trackFactory from "./trackFactory"

const queueItemFactory = Factory.define<IQueueItem>(({ sequence }) => {
  sequence = sequence - 1

  return {
    index: sequence,
    queueID: Symbol(`${sequence} queueID Test`),
    track: trackFactory.build(),
    isManuallyAdded: false,
  }
})

export default queueItemFactory
