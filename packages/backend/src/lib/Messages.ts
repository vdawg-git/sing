import mitt from "mitt"

import type { IBackEndMessages } from "@/types/Types"

import type { StrictOmit } from "ts-essentials"

// Gets passed to the handlers to forward data and notifications from the them to the main process

const base = mitt<IBackEndMessages>()

export const backendMessages = {
  emit: (data: IBackEndMessages[keyof IBackEndMessages]) =>
    base.emit(data.event, data),
  on: base.on,
  showNotification: (
    notification: IBackEndMessages["createNotification"]["data"]
  ) =>
    base.emit("createNotification", {
      event: "createNotification",
      data: notification,
      shouldForwardToRenderer: true,
    }),
  showAlert: (
    notification: StrictOmit<
      IBackEndMessages["createNotification"]["data"],
      "type"
    >
  ) =>
    base.emit("createNotification", {
      event: "createNotification",
      data: { type: "danger", ...notification },
      shouldForwardToRenderer: true,
    }),
}

export type IBackMessagesHandler = typeof backendMessages
