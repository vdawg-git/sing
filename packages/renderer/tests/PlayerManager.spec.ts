import { get } from "svelte/store"
import { beforeEach, describe, expect, it, vi } from "vitest"

import queueItemFactory from "./factories/queueItemFactory"
import mockElectronApi from "./MockElectronApi"

vi.mock("@/lib/manager/AudioPlayer")

vi.stubGlobal("api", mockElectronApi)

const {
  default: player,
  currentTrack,
  playIndex,
  queue,
  playState,
} = await import("@/lib/manager/player/index")

afterEach(async () => {
  vi.resetModules()
})

it("load the source of the first track on load", async () => {
  const source = get(currentTrack).track.filepath

  expect(source).toContain(".") // Check if it is a filepath
})

describe("fn: playQueueIndex", async () => {
  beforeEach(async () => {
    queueItemFactory.rewindSequence()
    queue.set(queueItemFactory.buildList(50))
    playIndex.set(10)
  })

  it("correctly sets current track", async () => {
    const indexToGo = 20
    const $queue = get(queue)

    player.playQueueIndex(indexToGo)

    const newCurrentTrack = get(currentTrack)

    expect(
      newCurrentTrack.queueID === $queue.at(indexToGo)?.queueID
    ).toBeTruthy()
  })

  it("sets the state to 'playing'", async () => {
    const indexToGo = 20
    player.playQueueIndex(indexToGo)

    expect(get(playState)).toBe("PLAYING")
  })
})

describe("fn: removeIndexFromQueue", async () => {
  it("keeps the current track when a previously played item gets removed", async () => {
    player.next()
    player.next()

    const oldCurrentTrack = get(currentTrack)

    player.removeIndexFromQueue(get(playIndex) - 1)

    const newCurrentTrack = get(currentTrack)

    expect(oldCurrentTrack.track?.title).toBe(newCurrentTrack.track.title)
  })
})

it("current track is not undefined after switching tracks", async () => {
  player.next()
  player.next()

  expect(get(currentTrack)).not.toBeUndefined()
})
