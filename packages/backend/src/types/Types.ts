import type {
  InnerArray,
  IFrontendEvents,
  FlattenedParameters,
} from "@sing-types/Types"

import type { oneWayHandler } from "../lib/OneWayHandler"
import type { twoWayHandler } from "../lib/TwoWayHandler"

export interface ICoverData {
  coverMD5: string
  coverPath: string
  coverBuffer: Buffer
}

export type ITwoWayHandlers = {
  readonly [key in ITwoWayEvents]: {
    readonly response: Awaited<ReturnType<typeof twoWayHandler[key]>>
    readonly args: InnerArray<Awaited<Parameters<typeof twoWayHandler[key]>>>
  }
}

export type ITwoWayResponse = {
  id: string
  data: ITwoWayHandlers[ITwoWayEvents]["response"]
}

export type ITwoWayEvents = keyof typeof twoWayHandler

export type ITwoWayRequest = {
  readonly id: string
  readonly event: ITwoWayEvents
  readonly args: ITwoWayHandlers[ITwoWayEvents]["args"]
}

export type IBackendEmitChannels = keyof typeof oneWayHandler

export type IBackendEmitHandlers = {
  readonly [key in IBackendEmitChannels]: {
    readonly emitTo: IBackToFrontChannels[key]
    readonly args: IBackEventParamters<key>
  }
}

export type IBackEventParamters<Event extends IBackendEmitChannels> =
  InnerArray<Awaited<Parameters<typeof oneWayHandler[Event]>>>

export type IBackToFrontChannels = ValidateBackToFrontEvents<{
  readonly syncMusic: "setMusic"
}>

export interface IBackendMessageToForward {
  readonly forwardToRenderer: true
  readonly event: keyof IFrontendEvents
  readonly data: FlattenedParameters<IFrontendEvents[keyof IFrontendEvents]>
}

export type IEmittedDataToBackend = {
  readonly event: IBackendEmitChannels
  readonly args: IBackendEmitHandlers[IBackendEmitChannels]["args"]
}

export type IBackendRequest = ITwoWayRequest | IEmittedDataToBackend

type ValidateBackToFrontEvents<
  T extends Readonly<
    Record<IBackendEmitChannels, keyof IFrontendEvents | undefined>
  >
> = T
