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

export function addNotification(
  notification: INotification,
  position: "top" | "bottom" = "top"
): void {
  update(($store) =>
    position === "top" ? [notification, ...$store] : [...$store, notification]
  )
}

export function removeNotificationByID(notificationID: symbol): void {
  update(($store) => $store.filter(({ id }) => id !== notificationID))
}

export function removeNotificationsByLabel(labelToDelete: string): void {
  update(($store) => $store.filter(({ label }) => label !== labelToDelete))
}

export default {
  subscribe,
}
