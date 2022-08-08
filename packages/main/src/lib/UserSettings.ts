import ElectronStore from "electron-store"

import type { DirectoryPath } from "@sing-types/Filesystem"

export interface IUserSettings {
  musicFolders?: DirectoryPath[]
}
export type IUserSettingsKey = keyof IUserSettings

const schema = {
  musicFolders: {
    description: "The music folders to be synced with the database",
    type: "array",
    items: { type: "string" },
    uniqueItems: true,
    minItems: 0,
    nullable: true,
    default: [],
  },
}

// @ts-expect-error
const userSettingsStore = new ElectronStore<IUserSettings>({ schema })

export default userSettingsStore
