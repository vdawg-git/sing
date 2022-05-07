import { beforeEach, describe, expect, it, vi } from "vitest"
import { TEST_IDS as id, TEST_GROUPS as group } from "@/Consts"
import {
  render,
  fireEvent,
  waitForElementToBeRemoved,
} from "@testing-library/svelte"
import player, {
  playedTracks,
  nextTracks,
  currentTrack,
  playIndex,
} from "@/lib/manager/PlayerManager"
import mockElectronApi from "./MockElectronApi"
import type { ITrack } from "@sing-types/Track"
import mockedTracksData from "./MockTracksData"

vi.stubGlobal("api", mockElectronApi)

afterEach(async () => {
  vi.resetModules()
})

it.todo("correctly plays track when called from queue", async () => {
  // player.playFromSymbol()
})
