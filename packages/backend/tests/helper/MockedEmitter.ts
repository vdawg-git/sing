import { vi } from "vitest"

import type { IHandlerEmitter, ISendToMainKey } from "@/types/Types"

export default function createMockedEmitter(): IHandlerEmitter & {
  getEmits: () => unknown[]
} {
  const emits: Record<ISendToMainKey, unknown[]> = {
    sendToMain: [],
  }

  return {
    addListener: vi.fn(),
    removeListener: vi.fn(),
    emit: vi.fn((data: unknown) => {
      emits.sendToMain.push(data)
      return true
    }),
    on: vi.fn(),
    once: vi.fn(),
    off: vi.fn(),
    removeAllListeners: vi.fn(),
    setMaxListeners: vi.fn(),
    getMaxListeners: vi.fn(),
    listenerCount: vi.fn(),
    listeners: vi.fn(),
    rawListeners: vi.fn(),
    prependListener: vi.fn(),
    prependOnceListener: vi.fn(),
    eventNames: vi.fn(),

    getEmits(channel: ISendToMainKey = "sendToMain") {
      return emits[channel]
    },
  }
}
