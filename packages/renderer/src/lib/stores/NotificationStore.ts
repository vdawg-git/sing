import { writable } from "svelte/store"

import type { INotification } from "@sing-types/Types"

const { subscribe, update } = writable<INotification[]>([])

function addNotification(
  notification: INotification,
  position: "top" | "bottom" = "bottom"
): void {
  update(($store) =>
    position === "top" ? [notification, ...$store] : [...$store, notification]
  )
}

function removeNotification(notificationID: symbol): void {
  update(($store) => $store.filter(({ id }) => id !== notificationID))
}

export default {
  subscribe,
  addNotification,
  removeNotification,
}
