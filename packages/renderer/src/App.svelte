<script lang="ts">
  import Sidebar from "./lib/organisms/Sidebar.svelte"
  import MyTracks from "./lib/pages/MyTracks.svelte"
  import Playbar from "./lib/organisms/Playbar.svelte"
  import playerManager from "./lib/manager/PlayerManager"
  import QueueBar from "./lib/organisms/QueueBar.svelte"
  import { onDestroy } from "svelte"

  import trackStore from "./lib/stores/TracksStore"
  trackStore.subscribe((_) => {})

  let showQueue = false
  let queueIcon: Node

  onDestroy(() => playerManager.destroy())
</script>

<main class="bg-grey-900 text-white select-none ">
  <div class="flex">
    <Sidebar />
    <MyTracks />
  </div>
  <Playbar on:clickQueueIcon={() => (showQueue = !showQueue)} />
</main>

<QueueBar show={showQueue} on:hide={() => (showQueue = false)} />
