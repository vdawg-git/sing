import { beforeEach, describe, expect, it, vi } from "vitest"
import { TEST_IDS as id, testAttr } from "@/TestConsts"
// import {
//   render,
//   fireEvent,
//   waitForElementToBeRemoved,
// } from "@testing-library/svelte"
import mockElectronApi from "./MockElectronApi"
vi.stubGlobal("api", mockElectronApi)
vi.mock("@/lib/manager/AudioPlayer", () => {
  return { default: mockedAudioPlayer }
})
import indexStore from "@/lib/stores/PlayIndex"
import queueStore from "@/lib/stores/QueueStore"
import { get } from "svelte/store"
import mockedAudioPlayer from "./mocks/AudioPlayer"
import player, {
  playedTracks,
  currentTrack,
  playIndex,
  nextTracks,
  playState,
} from "@/lib/manager/PlayerManager"
import type { ITrack } from "@sing-types/Track"
import queueItemFactory from "./factories/queueItemFactory"

afterEach(async () => {
  vi.resetModules()
})

it("load the source of the first track on load", async () => {
  const source = get(currentTrack).track.filepath

  expect(source).toContain(".")
})

describe("fn: playQueueIndex", async () => {
  beforeEach(async () => {
    queueItemFactory.rewindSequence()
    queueStore.set(queueItemFactory.buildList(50))
    indexStore.set(10)
  })

  it("correctly sets current track", async () => {
    const indexToGo = 20
    const $queue = get(queueStore)

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

// describe("fn: deleteQueueItemAtIndex", async () => {})
