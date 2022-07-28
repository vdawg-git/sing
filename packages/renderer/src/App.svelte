<script lang="ts">
  import { Router, Route, createHistory } from "svelte-navigator"
  import Sidebar from "./lib/organisms/Sidebar.svelte"
  import MyTracks from "./lib/pages/MyTracks.svelte"
  import Playbar from "./lib/organisms/Playbar.svelte"
  import tracksStore from "@/lib/stores/TracksStore"
  import Settings from "@/lib/pages/Settings.svelte"
  import { createHashSource } from "./Helper"
  import { routes } from "./Consts"
  import NotificationsRenderer from "./lib/organisms/NotificationsRenderer.svelte"

  tracksStore.subscribe((_) => {}) // Never undload tracks

  const hashHistory = createHistory(createHashSource())
</script>

<main class="select-none bg-grey-900 text-white ">
  <NotificationsRenderer />
  <Router history={hashHistory}>
    <div class="flex">
      <Sidebar />
      <div class="h-screen w-full overflow-auto   sm:ml-2 md:ml-6 lg:ml-10 ">
        <Route path={routes["settings/general"]}>
          <Settings />
        </Route>
        <Route path={routes["settings/library"]}>
          <Settings />
        </Route>

        <Route path={routes.tracks}>
          <MyTracks />
        </Route>
        <Route>
          <MyTracks />
        </Route>
      </div>
    </div>
    <Playbar />
  </Router>
</main>
