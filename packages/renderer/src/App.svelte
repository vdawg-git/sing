<script lang="ts">
  debugger

  import { Router, Route, createHistory } from "svelte-navigator"
  import Sidebar from "./lib/organisms/Sidebar.svelte"
  import MyTracks from "./lib/pages/MyTracks.svelte"
  import Playbar from "./lib/organisms/Playbar.svelte"
  import Settings from "@/lib/pages/Settings.svelte"
  import { ROUTES } from "./Consts"
  import NotificationsRenderer from "./lib/organisms/NotificationsRenderer.svelte"
  import { createHashSource } from "./Helper"
  import initNotificationHandler from "./lib/manager/NotificationManager"
  import { onDestroy } from "svelte"

  const hashHistory = createHistory(createHashSource())

  const unsubscribers = initNotificationHandler()

  onDestroy(() => {
    for (const unsubscriber of unsubscribers) {
      unsubscriber()
    }
  })
</script>

<main class="select-none bg-grey-900 text-white ">
  <NotificationsRenderer />

  <Router history={hashHistory}>
    <div class="flex">
      <Sidebar />
      <div class="h-screen w-full overflow-auto   sm:ml-2 md:ml-6 lg:ml-10 ">
        <Route path={ROUTES["settings/general"]}>
          <Settings />
        </Route>
        <Route path={ROUTES["settings/library"]}>
          <Settings />
        </Route>

        <Route path={ROUTES.tracks}>
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
