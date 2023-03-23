import { TEST_ATTRIBUTES } from "@sing-renderer/TestConsts"

import type { ElectronApplication } from "playwright"

export async function createNotificationsOrganism(
  electron: ElectronApplication
) {
  const page = await electron.firstWindow()

  const notification = page.locator(TEST_ATTRIBUTES.asQuery.notification),
    closeButton = page.locator(TEST_ATTRIBUTES.asQuery.notificationCloseButton)

  return {
    notification,
    closeAll,
    waitForNotification,
  }

  /** This function is just meant as a cleanup and does not really simulate user interaction */
  async function closeAll() {
    for (const button of await closeButton.all()) {
      button.dispatchEvent("click")
    }
  }

  async function waitForNotification(label: string) {
    await notification.getByText(label).first().waitFor({ state: "visible" })
  }
}
