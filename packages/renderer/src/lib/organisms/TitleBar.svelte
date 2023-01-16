<script lang="ts">
  import Edge from "virtual:icons/custom/inverted_edge-16px"
  import IconMinimize from "virtual:icons/heroicons/minus-20-solid"
  import IconMaximize from "virtual:icons/custom/maximize_icon"
  import IconClose from "virtual:icons/heroicons/x-mark-20-solid"
  import IconUnsetFullscreen from "virtual:icons/custom/unset_fullscreen_icon"

  let isFullscreen = false

  async function toggleFullscreen() {
    isFullscreen = await window.api.toggleFullscreen()
  }
</script>

<!-- Draggable area -->
<div class="draggable fixed z-[888] h-5 w-[calc(100%-120px)]" />

<!-- Icons - always on top -->
<div class="fixed right-0 z-[999] flex h-5 w-max items-center justify-end">
  {#await window.api.isMacOS() then isMacOS}
    <!-- // eslint-disable-next-line no-undef -->
    {#if isMacOS === false}
      <div
        class="button hover:bg-grey-500"
        on:click={window.api.minimizeWindow}
      >
        <IconMinimize class="h-4 w-4" />
      </div>

      <div class="button hover:bg-grey-500" on:click={toggleFullscreen}>
        {#if isFullscreen}
          <IconUnsetFullscreen class="h-4 w-4 stroke-1" />
        {:else}
          <IconMaximize class="h-4 w-4 stroke-1" />
        {/if}
      </div>

      <div
        class="button hover:bg-red-600 hover:hover:text-white"
        on:click={window.api.closeApp}
      >
        <IconClose class="h-4 w-4 " />
      </div>
    {/if}
  {/await}
</div>

<!-- Visible title bar -->
<div class="fixed  z-20 h-5  w-full bg-grey-900/50 backdrop-blur-sm ">
  <!-- The inverted border radius edges -->
  <Edge
    class="absolute right-0 top-5 h-2 w-2 text-grey-900/50 ring-0 backdrop-blur-sm"
  />
  <Edge
    class="absolute left-0 top-5 h-2 w-2 scale-x-[-1] text-grey-900/50 ring-0 backdrop-blur-sm"
  />
</div>

<style lang="postcss">
  .button {
    width: 40px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: theme(colors.grey.300);
    transition: background 100ms cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-app-region: no-drag;

    &:hover {
      color: theme(colors.white);
    }
  }

  .draggable {
    app-region: drag;
    user-select: none;
    -webkit-app-region: drag;
    -webkit-user-select: none;
  }
</style>
