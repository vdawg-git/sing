import { createBasePage } from "./BasePage"

import type { ElectronApplication } from "playwright"

export async function createBaseSettingsPage(electronApp: ElectronApplication) {
  return {
    ...(await createBasePage(electronApp)),
  }
}
