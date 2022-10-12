<script lang="ts">
  import SidebarItem from "../atoms/SidebarItem.svelte"
  import IconRefresh from "virtual:icons/heroicons-outline/refresh"
  import Logo from "virtual:icons/custom/drool"
  import IconMusic from "virtual:icons/heroicons-outline/music-note"
  import IconSettings from "virtual:icons/heroicons-outline/cog"
  import IconArtists from "virtual:icons/heroicons-outline/microphone"
  import IconDotsVr from "virtual:icons/heroicons-outline/dots-vertical"
  import { createOpenContextMenu, createOpenMenu } from "../manager/menu"

  // import IconPlaylist from "virtual:icons/tabler/playlist"
  import IconAlbum from "virtual:icons/ri/album-line"
  // import IconGenre from "virtual:icons/mdi/guitar-pick-outline"
  import { TEST_IDS as id } from "@/TestConsts"
  import type { SvelteComponentDev } from "svelte/internal"
  import { ROUTES, type IRoutes } from "@/Consts"
  import { useNavigate } from "svelte-navigator"
  import type { IOpenMenuArgument } from "@/types/Types"

  const navigate = useNavigate()

  const menuItems: {
    name: String
    icon: typeof SvelteComponentDev
    to: IRoutes
  }[] = [
    { name: "Tracks", icon: IconMusic, to: "tracks" },
    { name: "Albums", icon: IconAlbum, to: "albums" },
    { name: "Artists", icon: IconArtists, to: "artists" },
  ]

  // Temporary for testing purposes
  const settingsDropdownItems: IOpenMenuArgument = {
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
  } as const

  const openSettingsMenu = createOpenMenu(settingsDropdownItems)
</script>

<nav
  data-testid={id.sidebar}
  class="
    custom_style z-30 h-screen w-[15.5rem]  flex-shrink-0
    flex-grow-0 rounded-3xl border border-grey-400/50 bg-grey-800/50
    p-6 backdrop-blur-sm
    "
>
  <div class="mb-10 flex justify-between">
    <Logo class="h-6 w-6  text-white/50" />
    <!---- Settings dropdown -->
    <button
      use:openSettingsMenu
      class=" rounded-full p-1 hover:bg-grey-500 active:scale-90"
    >
      <IconDotsVr class=" h-6  w-6 text-grey-300 " />
    </button>
  </div>

  <!---- Sidebar items -->
  {#each menuItems as item}
    <SidebarItem to={item.to}>
      <svelte:component
        this={item.icon}
        slot="icon"
        class="mr-3 h-6 w-6 text-grey-200"
      />
      <div slot="label">{item.name}</div>
    </SidebarItem>
  {/each}
</nav>

<style>
  .custom_style {
    box-shadow: 0px 0px 24px 0px rgba(0, 0, 0, 0.5);
  }
</style>
