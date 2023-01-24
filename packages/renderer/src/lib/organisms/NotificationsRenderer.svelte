<script lang="ts">
  import { flip } from "svelte/animate"

  import {
    notificationStore,
    removeNotificationByID,
  } from "@/lib/stores/NotificationStore"

  import Notification from "@/lib/molecules/Notification.svelte"

  function handleClose({ detail: id }: CustomEvent) {
    removeNotificationByID(id)
  }
</script>

<!--
@component
This renders the notifications from the `NotificationManager.ts`
-->

<div
  class="_notification absolute right-16 bottom-24 z-50 flex flex-col justify-end gap-4"
>
  {#each $notificationStore as { label, type, duration, id, isRemoveable } (id)}
    <div animate:flip={{ duration: 150 }}>
      <Notification
        {label}
        {type}
        {duration}
        {id}
        {isRemoveable}
        on:close={handleClose}
      />
    </div>
  {/each}
</div>
