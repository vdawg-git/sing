<script lang="ts">
  import { onDestroy } from "svelte"
  import { Router, Route, createHistory } from "svelte-navigator"

  import Settings from "./lib/pages/Settings.svelte"
  import { ROUTES } from "./Routes"
  import { createHashSource } from "./Helper"
  import BackgroundGallery from "./lib/atoms/BackgroundGallery.svelte"
  import { initNotificationHandler } from "./lib/manager/NotificationManager"
  import MenuElement from "./lib/manager/menu/MenuElement.svelte"
  import BackAndForthNavigation from "./lib/molecules/BackAndForthNavigation.svelte"
  import NotificationsRenderer from "./lib/organisms/NotificationsRenderer.svelte"
  import Playbar from "./lib/organisms/Playbar.svelte"
  import Searchbar from "./lib/organisms/Searchbar.svelte"
  import Sidebar from "./lib/organisms/Sidebar.svelte"
  import Album from "./lib/pages/Album.svelte"
  import Albums from "./lib/pages/Albums.svelte"
  import Artist from "./lib/pages/Artist.svelte"
  import Artists from "./lib/pages/Artists.svelte"
  import Playlists from "./lib/pages/Playlists.svelte"
  import Tracks from "./lib/pages/Tracks.svelte"
  import { backgroundImages } from "./lib/stores/BackgroundImages"
  import Playlist from "./lib/pages/Playlist.svelte"
  import TitleBar from "./lib/organisms/TitleBar.svelte"

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

<!-- Create inset shadows for increased depth of the UI -->
<div
  class="_morphism pointer-events-none fixed z-[9999] h-screen w-screen touch-none"
/>

<div
  class=" h-screen max-h-screen w-screen max-w-[100vw] select-none overflow-hidden text-white"
>
  <Router history={hashHistory}>
    <NotificationsRenderer />

    <Playbar />

    <MenuElement />

    <div class="flex w-full">
      <Sidebar />

      <TitleBar />

      <main
        class="
          relative flex h-screen
          max-h-screen w-full
          content-start items-start
          justify-center  overflow-x-visible overflow-y-scroll  p-6
          sm:px-2 md:px-4 lg:px-8
          "
      >
        <div
          class="fixed top-10 right-6 z-20 flex w-[calc(100vw-256px)] justify-between gap-6"
        >
          <BackAndForthNavigation />
          <Searchbar />
        </div>

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

          <Route path={`${ROUTES.playlists}/*`}>
            <Route path="/">
              <Playlists />
            </Route>

            <Route path=":playlistID" component={Playlist} />
          </Route>

          <!---- Default route -->
          <Route>
            <Tracks />
          </Route>
        </div>
      </main>
    </div>

    <BackgroundGallery images={$backgroundImages} />
  </Router>
</div>

<style lang="postcss">
  ._morphism {
    /* An inset box shadow */
    box-shadow: inset 4px 4px 8px 0px rgba(255, 255, 255, 0.06),
      inset -5px -5px 10px 0px rgba(0, 0, 0, 0.4);
  }
</style>
