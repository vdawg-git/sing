<script lang="ts">
  import { Router, Route, createHistory } from "svelte-navigator"
  import Sidebar from "./lib/organisms/Sidebar.svelte"
  import Tracks from "./lib/pages/Tracks.svelte"
  import Playbar from "./lib/organisms/Playbar.svelte"
  import Settings from "@/lib/pages/Settings.svelte"
  import { ROUTES } from "./Consts"
  import NotificationsRenderer from "./lib/organisms/NotificationsRenderer.svelte"
  import { createHashSource } from "./Helper"
  import initNotificationHandler from "./lib/manager/NotificationManager"
  import { onDestroy } from "svelte"
  import Albums from "./lib/pages/Albums.svelte"
  import Album from "./lib/pages/Album.svelte"
  import Artists from "./lib/pages/Artists.svelte"
  import Artist from "./lib/pages/Artist.svelte"

  const hashHistory = createHistory(createHashSource())

  const unsubscribers = initNotificationHandler()

  onDestroy(() => {
    for (const unsubscriber of unsubscribers) {
      unsubscriber()
    }
  })
</script>

<main class="select-none  text-white ">
  <NotificationsRenderer />

  <Router history={hashHistory}>
    <div class="flex">
      <Sidebar />

      <main
        class="
          flex h-screen max-h-screen
          w-full content-start  items-start
          justify-center overflow-auto overflow-x-clip
          p-6 sm:px-2 md:px-6 lg:px-10"
      >
        <div class="w-full max-w-full lg:max-w-[1560px]">
          <Route path={ROUTES.settingsGeneral}>
            <Settings />
          </Route>
          <Route path={ROUTES.settingsLibrary}>
            <Settings />
          </Route>

          <Route path={ROUTES.tracks}>
            <Tracks />
          </Route>

          <Route path={`${ROUTES.albums}/*`}>
            <Route path="/">
              <Albums />
            </Route>

            <Route path=":albumID" component={Album} />
          </Route>

          <Route path={`${ROUTES.artists}/*`}>
            <Route path="/">
              <Artists />
            </Route>

            <Route path=":artistID" component={Artist} />
          </Route>

          <Route>
            <Tracks />
          </Route>
        </div>
      </main>
    </div>

    <Playbar />
  </Router>
</main>
