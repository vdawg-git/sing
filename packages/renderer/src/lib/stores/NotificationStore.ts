import { writable } from "svelte/store"

import type { INotificationBase, INotification } from "@sing-types/Types"

const { subscribe, update } = writable<INotificationBase[]>([])

window.api.on("createNotification", (_event, notification) => {
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
  const toAdd: INotificationBase =
    notification.id !== undefined
      ? (notification as INotificationBase)
      : {
          ...notification,
          id: Symbol(notification.label),
        }

  update(($store) =>
    position === "top" ? [toAdd, ...$store] : [...$store, toAdd]
  )
}

export function removeNotificationByID(notificationID: symbol): void {
  update(($store) => $store.filter(({ id }) => id !== notificationID))
}

export function removeNotificationsByLabel(labelToDelete: string): void {
  update(($store) => $store.filter(({ label }) => label !== labelToDelete))
}

export const notificationStore = {
  subscribe,
}
