<script lang="ts">
  import { Router, Route, createHistory } from "svelte-navigator"
  import Sidebar from "./lib/organisms/Sidebar.svelte"
  import MyTracks from "./lib/pages/MyTracks.svelte"
  import Playbar from "./lib/organisms/Playbar.svelte"
  import tracksStore from "@/lib/stores/TracksStore"
  import NoContent from "@/lib/organisms/NoContent.svelte"
  import { createHashSource } from "./Helper"

  tracksStore.subscribe((_) => {}) // Never undload tracks

  const hashHistory = createHistory(createHashSource())
</script>

<main class="select-none bg-grey-900 text-white ">
  <div class="flex">
    <Sidebar />
    <div class="h-screen w-full overflow-auto   sm:ml-2 md:ml-6 lg:ml-10 ">
      <Router history={hashHistory}>
        <Route path="settings">
          <NoContent />
        </Route>

        <Route path="tracks">
          <MyTracks />
        </Route>
        <Route>
          <MyTracks />
        </Route>
      </Router>
    </div>
  </div>
  <Playbar />
</main>
