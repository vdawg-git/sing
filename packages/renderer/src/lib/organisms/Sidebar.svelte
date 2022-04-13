<script lang="ts">
  import Menu from "../molecules/Menu.svelte"
  import SidebarItem from "../atoms/SidebarItem.svelte"
  import MenuItem from "../atoms/MenuItem.svelte"

  import IconRefresh from "virtual:icons/heroicons-outline/refresh"
  import Logo from "virtual:icons/custom/drool"
  import IconMusic from "virtual:icons/heroicons-outline/music-note"
  import IconMicrophone from "virtual:icons/heroicons-outline/microphone"
  import IconPlaylist from "virtual:icons/tabler/playlist"
  import IconAlbum from "virtual:icons/ri/album-line"
  import IconGenre from "virtual:icons/mdi/guitar-pick-outline"

  const menuItems = [
    { name: "Playlists", icon: IconPlaylist, callback: tmp },
    { name: "Albums", icon: IconAlbum, callback: tmp },
    { name: "Tracks", icon: IconMusic, callback: tmp },
    { name: "Artists", icon: IconMicrophone, callback: tmp },
    { name: "Genre", icon: IconGenre, callback: tmp },
  ]

  function tmp() {}
</script>

<div
  class="custom_style w-[15.5rem] flex-shrink-0 h-screen bg-grey-800 rounded-2xl p-6"
>
  <div class="mb-10 flex justify-between">
    <Logo class="w-6 h-6  text-white/50" />
    <Menu>
      <MenuItem on:click={(e) => window.api.sync()}>
        <IconRefresh slot="icon" class="text-grey-300 w-6 h-6 mr-3" />
        <div slot="text">Refresh</div>
      </MenuItem>
    </Menu>
  </div>

  {#each menuItems as menuItem}
    <SidebarItem marginBottom="0.25" calllback={menuItem.callback}>
      <svelte:component
        this={menuItem.icon}
        slot="icon"
        class="text-grey-300 w-6 h-6 mr-3"
      />
      <div slot="text">{menuItem.name}</div>
    </SidebarItem>
  {/each}
</div>

<style>
  .custom_style {
    box-shadow: 0px 0px 24px 0px rgba(0, 0, 0, 0.5),
      0px 0px 4px 0px rgba(0, 0, 0, 1),
      inset 4px 4px 8px 0px rgba(255, 255, 255, 0.04);
  }
</style>
