<script lang="ts">
  import Edge from "virtual:icons/custom/inverted_edge-16px"
  import IconMinimize from "virtual:icons/heroicons/minus-20-solid"
  import IconMaximize from "virtual:icons/custom/maximize_icon"
  import IconClose from "virtual:icons/heroicons/x-mark-solid"
</script>

<!-- Draggable area -->
<div class="draggable fixed z-[999] h-6 w-[calc(100%-120px)]" />

<!-- Visible title bar -->
<div
  class="fixed z-20 flex h-6 w-full items-center justify-end bg-grey-900/50 backdrop-blur-sm"
>
  <div class="button hover:bg-grey-500" on:click={window.api.minimizeWindow}>
    <IconMinimize class="h-4 w-4" />
  </div>

  <div class="button hover:bg-grey-500" on:click={window.api.toggleFullscreen}>
    <IconMaximize class="h-4 w-4 stroke-1" />
  </div>

  <div
    class="button hover:bg-red-600 hover:hover:text-white"
    on:click={window.api.closeApp}
  >
    <IconClose class="h-4 w-4 " />
  </div>

  <!-- The inverted border radius edges -->
  <Edge
    class="absolute right-0 top-6 text-grey-900/70 ring-0 backdrop-blur-sm"
  />
  <Edge
    class="absolute left-0 top-6 scale-x-[-1] text-grey-900/70 ring-0 backdrop-blur-sm"
  />
</div>

<style lang="postcss">
  .button {
    width: 40px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: theme(colors.grey.300);
    transition: background 120ms cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-app-region: no-drag;
  }

  .draggable {
    app-region: drag;
    user-select: none;
    -webkit-app-region: drag;
    -webkit-user-select: none;
  }
</style>
