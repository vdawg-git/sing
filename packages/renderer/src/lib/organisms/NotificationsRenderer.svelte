<script lang="ts">
  import notificationStore from "@/lib/stores/NotificationStore"
  import Notification from "@/lib/molecules/Notification.svelte"
  import { flip } from "svelte/animate"

  function handleRemove({ detail: id }: CustomEvent) {
    notificationStore.removeNotification(id)
  }
</script>

<div class="absolute bottom-32 right-16 z-50 flex flex-col gap-4">
  {#each $notificationStore as { label, type, duration, id } (id)}
    <div animate:flip={{ duration: 150 }}>
      <Notification {label} {type} {duration} {id} on:close={handleRemove} />
    </div>
  {/each}
</div>
