import ElectronStore from "electron-store"

export interface IUserSettings {
  musicFolders?: string[]
  lightTheme?: boolean
}
export type IUserSettingsKey = keyof IUserSettings

const schema = {
  musicFolders: {
    description: "The music folders to be synced with the database",
    type: "array",
    items: { type: "string" },
    uniqueItems: true,
    minItems: 1,
    nullable: true,
  },
  lightTheme: {
    type: "boolean",
    nullable: true,
  },
}

// @ts-expect-error
const userSettingsStore = new ElectronStore<IUserSettings>({ schema })

export default userSettingsStore
