import createBasePage from "./BasePage"

import type { ElectronApplication } from "playwright"

export default async function createBaseSettingsPage(
  electronApp: ElectronApplication
) {
  return {
    ...(await createBasePage(electronApp)),
  }
}
