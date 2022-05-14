import { beforeEach, describe, expect, it, vi } from "vitest"
import { TEST_IDS as id, TEST_GROUPS as group } from "@/Consts"
// import {
//   render,
//   fireEvent,
//   waitForElementToBeRemoved,
// } from "@testing-library/svelte"
import mockElectronApi from "./MockElectronApi"
import mockedTracksData from "./MockTracksData"
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
} from "@/lib/manager/PlayerManager"
import type { ITrack } from "@sing-types/Track"
import queueItemFactory from "./factories/queueItemFactory"

afterEach(async () => {
  vi.resetModules()
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
})

describe("fn: deleteQueueItemAtIndex", async () => {})
