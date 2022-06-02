<script lang="ts">
  import Sidebar from "./lib/organisms/Sidebar.svelte"
  import MyTracks from "./lib/pages/MyTracks.svelte"
  import Playbar from "./lib/organisms/Playbar.svelte"
  import tracksStore from "@/lib/stores/TracksStore"

  tracksStore.subscribe((_) => {}) // Never undload tracks
</script>

<main class="select-none bg-grey-900 text-white ">
  <div class="flex">
    <Sidebar />
    <MyTracks />
  </div>
  <Playbar />
</main>
