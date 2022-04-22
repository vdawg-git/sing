<script lang="ts">
  import Sidebar from "./lib/organisms/Sidebar.svelte"
  import MyTracks from "./lib/pages/MyTracks.svelte"
  import Playbar from "./lib/organisms/Playbar.svelte"
  import QueueBar from "./lib/organisms/QueueBar.svelte"
  import tracksStore from "@/lib/stores/TracksStore"
  import c from "ansicolor"

  console.log(c.bgGreen.underline(" XXXX "))

  tracksStore.subscribe((_) => {})

  let showQueue = false
</script>

<main class="select-none bg-grey-900 text-white ">
  <div class="flex">
    <Sidebar />
    <MyTracks />
  </div>
  <Playbar on:clickQueueIcon={() => (showQueue = !showQueue)} />
</main>

<QueueBar show={showQueue} on:hide={() => (showQueue = false)} />
