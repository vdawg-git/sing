import notificationHandlers from "./NotificationManagerHandlers"

import type { INotificationHandlers } from "./NotificationManagerHandlers"

export default function initNotificationHandler() {
  const unsubscribers: INotificationHandlers[keyof INotificationHandlers][] = []

  for (const handler of Object.values(notificationHandlers)) {
    const unsubscriber = handler()

    unsubscribers.push(unsubscriber)
  }

  return unsubscribers
}
