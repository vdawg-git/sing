import * as E from "fp-ts/lib/Either"

import { NOTIFICATION_LABEL } from "@/Constants"

import {
  addNotification,
  showSyncSussessNotification,
} from "../stores/NotificationStore"

export type INotificationHandlers = typeof notificationHandlers

/**
 * The listeners to be called at app startup.
 * They should add notifications for their respective events.
 *
 * For example, the `handleSyncSuccess` manages the 'sync' notifications.
 */
export const notificationHandlers = {
  handleSyncSuccess() {
    const unsubsriber = window.api.on("syncedMusic", (_, syncResult) => {
      if (E.isLeft(syncResult)) {
        addNotification({
          label: `${NOTIFICATION_LABEL.syncFailure}: ${
            syncResult.left.message || syncResult.left.error
          }`,
          id: Symbol(`Failed to sync. Database send invalid data.`),
          type: "danger",
          duration: -1,
        })
        return
      }

      showSyncSussessNotification()
    })
    return unsubsriber
  },
}
