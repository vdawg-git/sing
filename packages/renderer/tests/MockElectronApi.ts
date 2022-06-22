import type * as IipcRenderer from "@sing-preload/ipcRenderer"
import type { ITrack } from "@sing-types/Types"
import type {
  IUserSettings,
  IUserSettingsKey,
} from "@sing-main/lib/UserSettings"
import channels from "@sing-preload/Channels"
import { vi } from "vitest"
import trackFactory from "./factories/trackFactory"

trackFactory.rewindSequence()
const tracks = trackFactory.buildList(30)

export const mockedApiTracks: readonly ITrack[] = tracks

function createMockedElectronAPI(): typeof IipcRenderer {
  return {
    getTracks: vi.fn(() => Promise.resolve(mockedApiTracks)),
    sync: vi.fn(() => Promise.resolve(sync())),
    setUserSettings: vi.fn(setUserSettings),
    openDirectory,
    openMusicFolder: vi.fn(async () => {
      return { filePaths: ["X:/MockElectronApi"], canceled: false }
    }),
    getPath,
    getUserSetting: vi.fn(getUserSetting),
    listen,
    removeListener,
    send,
    resetSettings: vi.fn(),
  }
}

export default createMockedElectronAPI()

async function sync() {
  return
}

async function setUserSettings<Key extends IUserSettingsKey>(
  _setting: Key,
  _value: IUserSettings[Key]
) {
  return
}

async function openDirectory(_options: Electron.OpenDialogOptions = {}) {
  return "F:/test/test"
}

async function getPath(_name: string) {
  throw new Error("not implemented")
}

async function getUserSetting(setting: IUserSettingsKey) {
  switch (setting) {
    case "musicFolders":
      return ["C:/mockedElectronApi0/", "C:/mockedElectronApi1/"]

    default:
      throw new Error(
        "could not find requested userSetting in mocked getUserSetting"
      )
  }
}

function listen(
  channel: typeof channels.listener[number],
  _callback: (args: any) => any
) {
  if (!channels.listener.includes(channel))
    throw new Error(`Invalid channel to listen to: ${channel}`)

  return
}

function removeListener(
  channel: typeof channels.listener[number],
  _callback: (args: any) => any
) {
  if (!channels.listener.includes(channel))
    throw new Error(`Invalid channel to listen to: ${channel}`)

  return
}

function send(_channel: typeof channels.listener[number], _message: string) {
  return
}
