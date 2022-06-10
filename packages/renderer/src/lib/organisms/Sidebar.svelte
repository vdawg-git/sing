<script lang="ts">
  import Menu from "../molecules/DropdownMenu.svelte"
  import SidebarItem from "../atoms/SidebarItem.svelte"
  import MenuItem from "../atoms/MenuItem.svelte"

  import IconRefresh from "virtual:icons/heroicons-outline/refresh"
  import Logo from "virtual:icons/custom/drool"
  import IconMusic from "virtual:icons/heroicons-outline/music-note"
  import IconMicrophone from "virtual:icons/heroicons-outline/microphone"
  import IconPlaylist from "virtual:icons/tabler/playlist"
  import IconAlbum from "virtual:icons/ri/album-line"
  import IconGenre from "virtual:icons/mdi/guitar-pick-outline"
  import { TEST_IDS as id } from "@/TestConsts"

  const menuItems = [
    { name: "Playlists", icon: IconPlaylist, onClick: tmp },
    { name: "Albums", icon: IconAlbum, onClick: tmp },
    { name: "Tracks", icon: IconMusic, onClick: tmp },
    { name: "Artists", icon: IconMicrophone, onClick: tmp },
    { name: "Genre", icon: IconGenre, onClick: tmp },
  ]

  function tmp() {} // Callback function for the sidebar items
</script>

<nav
  data-testid={id.sidebar}
  class="custom_style h-screen w-[15.5rem] flex-shrink-0 rounded-3xl bg-grey-800/50 p-6 outline outline-1 outline-grey-200/20"
>
  <div class="mb-10 flex justify-between">
    <Logo class="h-6 w-6  text-white/50" />
    <Menu menuTestID={id.sidebarMenu} iconTestID={id.sidebarMenuIcon}>
      <MenuItem on:click={() => window.api.sync()}>
        <IconRefresh slot="icon" class="mr-3 h-6 w-6 text-grey-300" />
        <div slot="text">Refresh</div>
      </MenuItem>
    </Menu>
  </div>

  {#each menuItems as item}
    <SidebarItem on:click={item.onClick}>
      <svelte:component
        this={item.icon}
        slot="icon"
        class="mr-3 h-6 w-6 text-grey-300"
      />
      <div slot="text">{item.name}</div>
    </SidebarItem>
  {/each}
</nav>

<style>
  .custom_style {
    box-shadow: 0px 0px 24px 0px rgba(0, 0, 0, 0.5);
  }
</style>
