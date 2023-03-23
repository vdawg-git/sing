import type { ElectronApplication } from "playwright"

import { createBasePage } from "#pages/BasePage"


export async function createBaseSettingsPage(electronApp: ElectronApplication) {
  return {
    ...(await createBasePage(electronApp)),
  }
}
