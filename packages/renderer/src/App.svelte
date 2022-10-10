<script lang="ts">
  import { Router, Route, createHistory } from "svelte-navigator"
  import { ROUTES } from "./Consts"
  import { createHashSource } from "./Helper"
  import { initNotificationHandler } from "./lib/manager/NotificationManager"
  import { backgroundImagesStore } from "./lib/stores/BackgroundImages"
  import { onDestroy } from "svelte"
  import Sidebar from "./lib/organisms/Sidebar.svelte"
  import Tracks from "./lib/pages/Tracks.svelte"
  import Playbar from "./lib/organisms/Playbar.svelte"
  import Settings from "@/lib/pages/Settings.svelte"
  import NotificationsRenderer from "./lib/organisms/NotificationsRenderer.svelte"
  import Albums from "./lib/pages/Albums.svelte"
  import Album from "./lib/pages/Album.svelte"
  import Artists from "./lib/pages/Artists.svelte"
  import Artist from "./lib/pages/Artist.svelte"
  import Searchbar from "./lib/organisms/Searchbar.svelte"
  import BackAndForthNavigation from "./lib/molecules/BackAndForthNavigation.svelte"
  import BackgroundGallery from "./lib/atoms/BackgroundGallery.svelte"
  import MenuElement from "./lib/manager/menu/MenuElement.svelte"

  const hashHistory = createHistory(createHashSource())

  const unsubscribers = initNotificationHandler()

  onDestroy(() => {
    for (const unsubscriber of unsubscribers) {
      unsubscriber()
    }
  })

  // TODO Make the BackgroundGallery a child of body and pass images to it via a store
  // because of https://css-tricks.com/popping-hidden-overflow/
</script>

<div
  class="h-screen max-h-screen w-screen max-w-[100vw] select-none overflow-hidden text-white "
>
  <Router history={hashHistory}>
    <NotificationsRenderer />

    <Playbar />

    <MenuElement />

    <div class="flex w-full">
      <Sidebar />

      <div
        class="fixed top-10 right-6 z-20 flex w-[calc(100vw-304px)] justify-between gap-6"
      >
        <BackAndForthNavigation />
        <Searchbar />
      </div>

      <main
        class="
          relative flex h-screen
          max-h-screen w-full
          content-start items-start
          justify-center  overflow-x-visible overflow-y-scroll  p-6
          sm:px-2 md:px-6 lg:px-10
          "
      >
        <!---- Pages -->

        <div
          class="max-h-screen w-full max-w-full overflow-x-visible lg:max-w-[1560px]"
        >
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

          <!---- Default route -->
          <Route>
            <Tracks />
          </Route>
        </div>
      </main>
    </div>

    <BackgroundGallery images={$backgroundImagesStore} />
  </Router>
</div>
