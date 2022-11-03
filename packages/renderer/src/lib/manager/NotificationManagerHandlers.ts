import * as E from "fp-ts/lib/Either"

import type { TypedIpcRenderer } from "@sing-preload/types/Types"

import { NOTIFICATION_LABEL } from "@/Consts"

import {
  addNotification,
  removeNotificationsByLabel,
} from "../stores/NotificationStore"

export interface INotificationHandlers {
  handleSyncSuccess: () => () => TypedIpcRenderer
}

/**
 * The listeners to be called at app startup.
 * They should add notifications for their respective events.
 *
 * For example, the `handleSyncSuccess` manages the 'sync' notifications.
 */
export const notificationHandlers: INotificationHandlers = {
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

      removeNotificationsByLabel(NOTIFICATION_LABEL.syncStarted)

      addNotification({
        label: NOTIFICATION_LABEL.syncSuccess,
        id: Symbol("Sync success"),
        type: "check",
      })
    })

    return unsubsriber
  },
}
