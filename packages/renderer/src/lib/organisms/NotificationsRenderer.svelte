<script lang="ts">
  import notificationStore from "@/lib/stores/NotificationStore"
  import Notification from "@/lib/molecules/Notification.svelte"
  import { flip } from "svelte/animate"

  function handleClose({ detail: id }: CustomEvent) {
    notificationStore.removeNotificationByID(id)
  }
</script>

<div class="absolute bottom-32 right-16 z-50 flex flex-col gap-4">
  {#each $notificationStore as { label, type, duration, id } (id)}
    <div animate:flip={{ duration: 150 }}>
      <Notification {label} {type} {duration} {id} on:close={handleClose} />
    </div>
  {/each}
</div>
