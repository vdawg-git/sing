<script lang="ts">
  import IconPause from "virtual:icons/bi/pause-fill"
  import IconPlay from "virtual:icons/bi/play-fill"
  import IconNext from "virtual:icons/heroicons-solid/fast-forward"
  import IconVolume from "virtual:icons/heroicons-outline/volume-up"
  import IconQueue from "virtual:icons/heroicons-outline/view-list"
  import IconRepeat from "virtual:icons/fluent/arrow-repeat-all-16-filled"
  import IconShuffle from "virtual:icons/eva/shuffle-2-outline"
  import QueueBar from "./QueueBar.svelte"
  import { secondsToDuration } from "@/Helper"

  import player, { currentTrack, playState } from "@/lib/manager/PlayerManager"
  import { createEventDispatcher } from "svelte"

  const dispatcher = createEventDispatcher()
  const clickQueueIcon = () => dispatcher("clickQueueIcon")

  $: track = $currentTrack?.track

  let trackProgress = 0
  let showQueue = false

  function handleClickQueueIcon() {
    showQueue = !showQueue
  }
</script>

<main
  class="
    custom_shadow absolute inset-x-0  bottom-0 
    z-50 grid h-[6rem] w-full 
    grid-cols-3 
    items-center justify-between  rounded-3xl  
    border border-grey-500 bg-grey-700/80 px-6
    backdrop-blur-xl
  "
  data-testid="playbar"
>
  <!-- Cover and meta data-->
  <div
    class="mr-6 flex max-w-fit shrink grow basis-[20rem] gap-4 overflow-hidden text-ellipsis"
  >
    <!---- Cover -->
    {#if track?.coverPath}
      <img
        class="h-14 w-14 bg-grey-600"
        alt={track?.title || "Title" + " " + " cover"}
        src={"file://" + track?.coverPath}
        data-testid="playbarCover"
      />
    {:else}
      <div class="w-14 h-14 bg-grey-600" data-testid="playbarCover" />
    {/if}

    <!---- Meta -->
    {#if track}
      <div class="mt-1 max-w-full overflow-hidden">
        <div
          class="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-lg"
          data-testid="playbarTitle"
        >
          {track?.title ?? track?.filepath.split("/").at(-1)}
        </div>
        <div class="flex max-w-full gap-3">
          <div
            class="shrink-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-grey-300"
            data-testid="playbarArtist"
          >
            {track?.artist ?? "Unknown"}
          </div>
          <div
            class="shrink-[10000] overflow-hidden text-ellipsis whitespace-nowrap text-sm text-grey-300"
            data-testid="playbarAlbum"
          >
            {track?.album ?? ""}
          </div>
        </div>
      </div>
    {/if}
  </div>

  <!------------------------------------>
  <!---- Playback controls -->
  <!---- Pause / Play / Next buttons-->
  <div class="flex min-w-[20rem] max-w-[62.5rem]  flex-col items-center">
    <div class="mb-1 flex items-center gap-6 text-white ">
      <!---- Backwards button-->
      <button
        on:click={() => player.previous()}
        data-testid="playbarBackButton"
        disabled={!$currentTrack}
        class="button rotate-180"
      >
        <IconNext class="h-8 w-8" />
      </button>
      <!---- Play button-->
      {#if $playState === "PLAYING"}
        <button
          on:click={() => player.pause()}
          data-testid="playbarPauseButton"
          disabled={!$currentTrack}
          class="button"
        >
          <IconPause class="h-12 w-12" />
        </button>
      {:else}
        <button
          on:click={() => player.resume()}
          data-testid="playbarPlayButton"
          disabled={!$currentTrack}
          class="button"
        >
          <IconPlay class="h-12 w-12" />
        </button>
      {/if}
      <!---- Forward button-->
      <button
        on:click={() => player.next()}
        data-testid="playbarNextButton"
        disabled={!track}
        class="button"
      >
        <IconNext class="h-8 w-8 " />
      </button>
    </div>
    <!----- Seekbar -->
    <div class="flex h-4 w-full  shrink items-center justify-center gap-4">
      <div class="text-xs text-grey-300" data-testid="seekbarCurrentTime">
        {!!track ? "0:00" : ""}
      </div>
      <div
        class="h-1 w-full  shrink overflow-hidden rounded-full bg-grey-600"
        data-testid="seekbar"
      >
        <div
          class="h-1 rounded-full bg-grey-300"
          style="width: {trackProgress * 100}%;"
          data-testid="seekbarProgressbar"
          data-progress={trackProgress * 100}
        />
      </div>
      <div
        class="min-w-[1.5rem] text-right text-xs text-grey-300"
        data-testid="seekbaarDuriation"
      >
        {!!track ? secondsToDuration(track.duration || 0) : ""}
      </div>
    </div>
  </div>
  <!------///----->

  <!---- Other controls-->
  <div class="flex gap-6 justify-self-end">
    <button data-testid="playbarVolumeIcon" class="button" disabled={!track}>
      <IconVolume class="h-6 w-6  sm:h-6" />
    </button>
    <button data-testid="playbarModeIcon" class="button" disabled={!track}>
      <IconShuffle class="h-6 w-6 sm:h-6" />
    </button>
    <button data-testid="playbarLoopIcon" class="button" disabled={!track}>
      <IconRepeat class="h-6 w-6 sm:h-6" />
    </button>
    <button
      on:click|stopPropagation={() => clickQueueIcon()}
      class="button"
      data-testid="playbarQueueIcon"
      disabled={!track}
      on:click={handleClickQueueIcon}
    >
      <IconQueue class="h-6 w-6  sm:h-6" />
    </button>
  </div>
</main>

{#if showQueue}
  <QueueBar />
{/if}

<style lang="postcss">
  .custom_shadow {
    box-shadow: 0 0 32px 0 rgba(0, 0, 0, 0.5);
  }

  * {
    white-space: nowrap;
  }

  .button {
    color: theme(colors.white);
    cursor: pointer;
    @apply transition-transform active:scale-95;

    &:hover {
      color: theme(colors.grey.300);
    }

    &:disabled {
      cursor: default;
      color: theme(colors.grey.300);
      @apply active:scale-[1];
    }
  }
</style>
