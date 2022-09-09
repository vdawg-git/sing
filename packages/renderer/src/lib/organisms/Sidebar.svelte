<script lang="ts">
  import Menu from "../molecules/DropdownMenu.svelte"
  import SidebarItem from "../atoms/SidebarItem.svelte"
  import MenuItem from "../atoms/MenuItem.svelte"

  import IconRefresh from "virtual:icons/heroicons-outline/refresh"
  import Logo from "virtual:icons/custom/drool"
  import IconMusic from "virtual:icons/heroicons-outline/music-note"
  import IconSettings from "virtual:icons/heroicons-outline/cog"
  import IconArtists from "virtual:icons/heroicons-outline/microphone"
  // import IconPlaylist from "virtual:icons/tabler/playlist"
  import IconAlbum from "virtual:icons/ri/album-line"
  // import IconGenre from "virtual:icons/mdi/guitar-pick-outline"
  import { TEST_IDS as id } from "@/TestConsts"
  import type { SvelteComponentDev } from "svelte/internal"
  import type { IRoutes } from "@/Consts"

  const menuItems: {
    name: String
    icon: typeof SvelteComponentDev
    to: IRoutes
  }[] = [
    { name: "Tracks", icon: IconMusic, to: "tracks" },
    { name: "Albums", icon: IconAlbum, to: "albums" },
    { name: "Artists", icon: IconArtists, to: "artists" },
  ]
</script>

<nav
  data-testid={id.sidebar}
  class="custom_style h-screen w-[15.5rem] flex-shrink-0 rounded-3xl bg-grey-800/50 p-6 backdrop-blur-sm"
>
  <div class="mb-10 flex justify-between">
    <Logo class="h-6 w-6  text-white/50" />
    <Menu menuTestID={id.sidebarMenu} iconTestID={id.sidebarMenuIcon}>
      <MenuItem to="settingsGeneral">
        <IconSettings slot="icon" class="mr-3 h-6 w-6 text-grey-300" />
        <div slot="label">Settings</div>
      </MenuItem>
      <MenuItem on:click={() => window.api.sync()}>
        <IconRefresh slot="icon" class="mr-3 h-6 w-6 text-grey-300" />
        <div slot="label">Refresh</div>
      </MenuItem>
    </Menu>
  </div>

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
