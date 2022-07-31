import { writable } from "svelte/store"

import type { INotification } from "@sing-types/Types"

const { subscribe, update } = writable<INotification[]>([])

window.api.listen("createNotification", (_event, notification) => {
  update(($store) => [
    ...$store,
    {
      ...notification,
      id: Symbol(notification.label), // Add a unique id to the notification
    },
  ])
})

function addNotification(
  notification: INotification,
  position: "top" | "bottom" = "bottom"
): void {
  update(($store) =>
    position === "top" ? [notification, ...$store] : [...$store, notification]
  )
}

function removeNotificationByID(notificationID: symbol): void {
  update(($store) => $store.filter(({ id }) => id !== notificationID))
}

function removeNotificationsByLabel(labelToDelete: string): void {
  update(($store) => $store.filter(({ label }) => label !== labelToDelete))
}

export default {
  subscribe,
  addNotification,
  removeNotificationByID,
  removeNotificationsByLabel,
}
