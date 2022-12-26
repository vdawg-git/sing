/* eslint-disable @typescript-eslint/no-unused-vars */
import * as E from "fp-ts/Either"
import { vi } from "vitest"

import trackFactory from "./factories/trackFactory"

import type { Either } from "fp-ts/Either"
import type * as ipcRenderer from "@sing-main/ipcRenderer"
import type { IError, ITrack } from "@sing-types/Types"
import type { IUserSettingsKey } from "@sing-main/lib/UserSettings"

trackFactory.rewindSequence()
const tracks = trackFactory.buildList(30)

export const mockedApiTracks: readonly ITrack[] = tracks
export const mockedApiTracksResponse: Either<IError, readonly ITrack[]> =
  E.right(tracks)

function createMockedElectronAPI(): typeof ipcRenderer {
  return {
    getTracks: vi.fn(() => Promise.resolve(mockedApiTracksResponse)),
    sync: vi.fn(),
    setUserSettings: vi.fn(),
    openDirectory: vi.fn(openDirectory),
    getUserSetting: vi.fn(getUserSetting),
    on: vi.fn(),
    removeListener: vi.fn(),
    send: vi.fn(),
    resetMusic: vi.fn(),
  }
}

export default createMockedElectronAPI()

async function openDirectory(
  _options?: Electron.OpenDialogOptions,
  defaultPath = "music"
) {
  return { filePaths: ["F:/test/test"], canceled: false }
}

async function getUserSetting(setting: IUserSettingsKey) {
  switch (setting) {
    case "musicFolders": {
      return ["C:/mockedElectronApi0/", "C:/mockedElectronApi1/"]
    }

    default: {
      throw new Error(
        "could not find requested userSetting in mocked getUserSetting"
      )
    }
  }
}
