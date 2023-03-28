import ElectronStore from "electron-store"

import { isDevelopment } from "@/Constants"

import type { DirectoryPath } from "../../../../types/Filesystem"

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

const name = isDevelopment ? "devConfig" : "config"

export const userSettingsStore = new ElectronStore<IUserSettings>({
  // @ts-expect-error
  schema,
  name,
})
