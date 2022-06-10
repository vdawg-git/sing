import createBasePage from "./Base"
import type { Page } from "playwright"

type ISettingsTab = "folder"

export default function createBaseSettingsPage(page: Page) {
  return {
    ...createBasePage(page),
    switchSettingsTab,
  }

  async function switchSettingsTab(tab: ISettingsTab) {
    throw new Error("Not implemented yet")
  }
}
