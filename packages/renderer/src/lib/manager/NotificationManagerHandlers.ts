import { NOTIFICATION_LABEL } from "@/Consts"
import { isLeft } from "fp-ts/lib/Either"

import { addNotification, removeNotificationsByLabel } from "../stores/NotificationStore"

import type { TypedIpcRenderer } from "@sing-preload/types/Types"
export interface INotificationHandlers {
  handleSyncSuccess: () => () => TypedIpcRenderer
}

const notificationHandlers: INotificationHandlers = {
  handleSyncSuccess() {
    const unsubsriber = window.api.listen("setMusic", (_, syncResult) => {
      if (isLeft(syncResult)) {
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

export default notificationHandlers
