import { notificationHandlers } from "./NotificationManagerHandlers"

import type { INotificationHandlers } from "./NotificationManagerHandlers"

/**
 * Calls the subscribers from [./NotificationManagerHandlers.ts](./NotificationManagerHandlers.ts).
 *
 * The notifications themselves are stored in [NotificationStore.ts](..\stores\NotificationStore.ts).
 *
 * They are rendered in [NotificationsRenderer.svelte](..\organisms\NotificationsRenderer.svelte).
 *
 * @returns The unsubscribers
 */
export function initNotificationHandler() {
  const unsubscribers: ReturnType<
    INotificationHandlers[keyof INotificationHandlers]
  >[] = []

  for (const handler of Object.values(notificationHandlers)) {
    const unsubscriber = handler()

    unsubscribers.push(unsubscriber)
  }

  return unsubscribers
}
