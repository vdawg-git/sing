<script lang="ts">
  import IconPause from "virtual:icons/bi/pause-fill"
  import IconPlay from "virtual:icons/bi/play-fill"
  import IconNext from "virtual:icons/heroicons-solid/fast-forward"
  import IconVolume from "virtual:icons/heroicons-outline/volume-up"
  import IconQueue from "virtual:icons/heroicons-outline/view-list"
  import IconRepeat from "virtual:icons/fluent/arrow-repeat-all-16-filled"
  import IconShuffle from "virtual:icons/eva/shuffle-2-outline"

  import player, { currentTrack, playState } from "../manager/PlayerManager"
  import { createEventDispatcher } from "svelte"

  const dispatcher = createEventDispatcher()
  const clickQueueIcon = () => dispatcher("clickQueueIcon")

  $: track = $currentTrack?.track
  let progress = 0.1
</script>

<div
  class="
    w-full bg-grey-700/80 backdrop-blur-xl  h-[6rem] 
    absolute inset-x-0 bottom-0 z-50 
    rounded-3xl 
    border border-grey-500  px-6  
    grid grid-cols-3 items-center justify-between
    custom_shadow
  "
  data-testid="playbar"
>
  <!-- Cover and meta data-->
  <div
    class="flex gap-4 shrink grow basis-[20rem] text-ellipsis overflow-hidden max-w-fit mr-6"
  >
    <!---- Cover -->
    <img
      class="w-14 h-14 bg-grey-600"
      alt={track?.title + " " + " cover"}
      src={track?.coverPath}
      data-testid="playbarCover"
    />
    <!---- Meta -->
    <div class="mt-1 max-w-full overflow-hidden">
      <div
        class="text-lg whitespace-nowrap overflow-hidden text-ellipsis max-w-full"
        data-testid="playbarTitle"
      >
        {track?.title ?? "Unknown"}
      </div>
      <div class="flex gap-3 max-w-full">
        <div
          class="text-sm text-grey-300 shrink-1 whitespace-nowrap overflow-hidden text-ellipsis"
          data-testid="playbarArtist"
        >
          {track?.artist ?? "Unknown"}
        </div>
        <div
          class="text-sm text-grey-300 shrink-[10000] whitespace-nowrap overflow-hidden text-ellipsis"
          data-testid="playbarAlbum"
        >
          {track?.album ?? ""}
        </div>
      </div>
    </div>
  </div>

  <!------------------------------------>
  <!---- Playback controls -->
  <!---- Pause / Play / Next buttons-->
  <div class="flex flex-col items-center  max-w-[62.5rem] min-w-[20rem]">
    <div class="flex gap-6 items-center text-white mb-1 ">
      <!---- Backwards button-->
      <div on:click={() => player.previous()} data-testid="playbarBackButton">
        <IconNext
          class="rotate-180 h-8 w-8 hover:text-grey-300 cursor-pointer"
        />
      </div>
      <!---- Play button-->
      {#if $playState === "PLAYING"}
        <div on:click={() => player.pause()} data-testid="playbarPauseButton">
          <IconPause
            width="3rem"
            height="3rem"
            class="hover:text-grey-300  cursor-pointer"
          />
        </div>
      {:else}
        <div on:click={() => player.resume()} data-testid="playbarPlayButton">
          <IconPlay
            width="3rem"
            height="3rem"
            class="hover:text-grey-300 cursor-pointer"
          />
        </div>
      {/if}
      <!---- Forward button-->
      <div on:click={() => player.next()} data-testid="playbarForwardButton">
        <IconNext class="w-8 h-8 hover:text-grey-300 cursor-pointer" />
      </div>
    </div>
    <!----- Seekbar -->
    <div class="w-full flex gap-4  items-center shrink justify-center">
      <div class="text-xs text-grey-300" data-testid="seekbarCurrentTime">
        1:32
      </div>
      <div
        class="h-1 w-full  bg-grey-600 rounded-full overflow-hidden shrink"
        data-testid="seekbar"
      >
        <div
          class="h-1 bg-grey-300 rounded-full"
          style="width: {progress * 100}%;"
          data-testid="seekbarProgressbar"
          data-progress={progress * 100}
        />
      </div>
      <div class="text-xs text-grey-300" data-testid="seekbaarDuriation">
        4:20
      </div>
    </div>
  </div>
  <!------///----->

  <!---- Other controls-->
  <div class="flex gap-6 justify-self-end">
    <div data-testid="playbarVolumeIcon">
      <IconVolume class="h-6 w-6 text-white hover:text-grey-300 sm:h-6" />
    </div>
    <div data-testid="playbarModeIcon">
      <IconShuffle class="h-6 w-6 text-white hover:text-grey-300 sm:h-6" />
    </div>
    <div data-testid="playbarLoopIcon">
      <IconRepeat class="h-6 w-6 text-white hover:text-grey-300 sm:h-6" />
    </div>
    <div
      on:click|stopPropagation={() => clickQueueIcon()}
      class="cursor-pointer text-white hover:text-grey-300 sm:h-6 "
      data-testid="playbarQueueIcon"
    >
      <IconQueue class="h-6 w-6 active:scale-95 transition-transform" />
    </div>
  </div>
</div>

<!-- fly={{ x: 400, duration: 200 }} -->
<style>
  .custom_shadow {
    box-shadow: 0 0 32px 0 rgba(0, 0, 0, 0.5);
  }

  * {
    white-space: nowrap;
  }
</style>
