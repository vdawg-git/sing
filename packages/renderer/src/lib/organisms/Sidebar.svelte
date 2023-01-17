<script lang="ts">
  import { useLocation, useNavigate } from "svelte-navigator"
  import Logo from "virtual:icons/custom/sing_logo"
  import IconSettings from "virtual:icons/heroicons/cog-6-tooth-solid"
  import IconDotsVr from "virtual:icons/heroicons/ellipsis-vertical-solid"
  import IconArtists from "virtual:icons/heroicons/microphone-solid"
  import IconMusic from "virtual:icons/heroicons/musical-note-solid"
  import IconRefresh from "virtual:icons/heroicons/arrow-path-solid"
  import IconAlbum from "virtual:icons/ri/album-fill"
  import IconPlaylist from "virtual:icons/tabler/playlist"

  import { createPlaylistURI, ROUTES, type IRoutes } from "@/Routes"
  import { TEST_IDS } from "@/TestConsts"
  import { createAddToPlaylistAndQueueMenuItems } from "@/MenuItemsHelper"

  import { createOpenMenu } from "../manager/menu"
  import SidebarItem from "../atoms/SidebarItem.svelte"
  import { playlistsStore } from "../stores/PlaylistsStore"
  import MenuSeperator from "../manager/menu/MenuSeperator.svelte"

  import type { IMenuItemsArgument, IOpenMenuArgument } from "@/types/Types"
  import type { SvelteComponentDev } from "svelte/internal"

  const navigate = useNavigate()

  const location = useLocation()
  $: currentRoute = $location.pathname.slice(1)

  type ISidebarItem = {
    label: string
    to: IRoutes
    icon?: typeof SvelteComponentDev
    contextMenuItems?: IMenuItemsArgument
  }

  const topItems: readonly ISidebarItem[] = [
    { label: "Playlists", icon: IconPlaylist, to: "playlists" },
    { label: "Tracks", icon: IconMusic, to: "tracks" },
    { label: "Albums", icon: IconAlbum, to: "albums" },
    { label: "Artists", icon: IconArtists, to: "artists" },
  ]

  let playlistItems: readonly ISidebarItem[]
  $: playlistItems = $playlistsStore.map((playlist) => ({
    label: playlist.name,
    to: createPlaylistURI(playlist.id),
    contextMenuItems: createAddToPlaylistAndQueueMenuItems($playlistsStore)({
      type: "playlist",
      id: playlist.id,
      name: playlist.name,
    }),
  }))

  const sidebarMenu: IOpenMenuArgument = {
    menuItems: [
      {
        label: "Settings",
        leadingIcon: IconSettings,
        onClick: async () => navigate(ROUTES.settingsGeneral),
        type: "item",
      },
      {
        label: "Resync library",
        leadingIcon: IconRefresh,
        onClick: async () => window.api.sync(),
        type: "item",
      },
    ],
    testID: TEST_IDS.sidebarMenu,
  } as const

  const openSettingsMenu = createOpenMenu(sidebarMenu)

  let isMacOS = false
  window.api.isMacOS().then((isTrue) => (isMacOS = isTrue))

  // TODO Idea: Minimize sidebar, extend it when hovering over playlists

  // TODO make playlist sortable by dragging them
</script>

<!-- Wrapper -->
<nav
  data-testid={TEST_IDS.sidebar}
  class="
    custom_style z-30 flex h-screen  w-[208px]
    flex-shrink-0 flex-grow-0 flex-col rounded-r-xl
    border border-grey-400/50  bg-grey-900/60 p-2 backdrop-blur-lg
    "
>
  <!-- Items -->

  <!-- Logo & Menu-->
  <div class="mb-4 mt-2 flex justify-between px-2" class:mt-6={isMacOS}>
    <Logo class="h-6 w-6  text-white/50" />
    <!---- Settings dropdown -->
    <button
      use:openSettingsMenu
      class=" rounded-full p-1 hover:bg-grey-500 active:scale-90"
      data-testid={TEST_IDS.sidebarMenuIcon}
    >
      <IconDotsVr class=" h-6  w-6 text-grey-300 " />
    </button>
  </div>

  <!---- Top Sidebar items -->
  {#each topItems as { label, icon, to }}
    <SidebarItem
      {to}
      {label}
      {icon}
      isActive={to === currentRoute || (to === "tracks" && currentRoute === "")}
    />
  {/each}

  <div class="_scroller flex flex-col overflow-auto">
    <!---- Playlist items -->
    {#if $playlistsStore.length > 0}
      <MenuSeperator marginX={12} />
      {#each playlistItems as { to, label, contextMenuItems }}
        <SidebarItem
          {to}
          {label}
          isActive={to === currentRoute}
          {contextMenuItems}
        />
      {/each}
    {/if}

    <div class="min-h-playbar w-full" />
  </div>
</nav>

<style lang="postcss">
  .custom_style {
    box-shadow: 0px 0px 24px 0px rgba(0, 0, 0, 0.5);
  }

  ._scroller {
    transition: all 0.5s ease-in-out;

    &::-webkit-scrollbar {
      position: absolute;
      width: 2px;
      z-index: 99999;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background-color: transparent;
      border-radius: 9999px;
    }

    &:hover&::-webkit-scrollbar-thumb {
      background-color: theme(colors.grey.600);
    }
  }
</style>
