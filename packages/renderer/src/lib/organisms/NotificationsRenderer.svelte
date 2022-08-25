<script lang="ts">
  /***/

  import notificationStore, {
    removeNotificationByID,
  } from "@/lib/stores/NotificationStore"
  import Notification from "@/lib/molecules/Notification.svelte"
  import { flip } from "svelte/animate"

  function handleClose({ detail: id }: CustomEvent) {
    removeNotificationByID(id)
  }
</script>

<!--
@component
This renders the notifications from the `NotificationManager.ts`
-->

<div class="absolute inset-x-16 bottom-24 z-50 flex flex-col gap-4">
  {#each $notificationStore as { label, type, duration, id } (id)}
    <div animate:flip={{ duration: 150 }}>
      <Notification {label} {type} {duration} {id} on:close={handleClose} />
    </div>
  {/each}
</div>
