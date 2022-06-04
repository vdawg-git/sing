<script lang="ts">
  import IconPause from "virtual:icons/heroicons-outline/pause"
  import IconPlay from "virtual:icons/heroicons-outline/play"
  import IconNext from "virtual:icons/heroicons-outline/fast-forward"
  import IconQueue from "virtual:icons/heroicons-outline/view-list"
  import VolumeControl from "@/lib/molecules/VolumeControl.svelte"
  import { onDestroy, onMount } from "svelte"

  import QueueBar from "./QueueBar.svelte"
  import Seekbar from "../molecules/Seekbar.svelte"
  import { TEST_IDS as test } from "@/TestConsts"

  import player, {
    currentTrack,
    playState,
    currentTime,
    volume as volumeStore,
  } from "@/lib/manager/PlayerManager"

  $: track = $currentTrack?.track

  let showQueue = false

  let volume: number = 1
  $: {
    player.setVolume(volume)
  }

  onMount(() => {
    volume = $volumeStore
  })

  function handleClickQueueIcon() {
    showQueue = !showQueue
  }

  function handleSeek({ detail: percentage }: CustomEvent) {
    player.seekTo(percentage)
  }

  onDestroy(player.destroy)
</script>

<main
  class="
    custom_shadow absolute inset-x-0
    bottom-0 z-20 grid h-[72px]
    w-full grid-cols-3 items-center  justify-between  
    rounded-3xl border border-grey-500 bg-grey-700/80
    px-6 backdrop-blur-xl
  "
  data-testid={test.playbar}
>
  <div class="absolute top-0 flex w-screen justify-center">
    <div class="w-[40%]">
      <Seekbar
        currentTime={$currentTime}
        duration={track?.duration}
        on:seek={(e) => handleSeek(e)}
      />
    </div>
  </div>

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
        data-testid={test.playbarCover}
      />
    {:else}
      <div class="w-14 h-14 bg-grey-600" data-testid={test.playbarCover} />
    {/if}

    <!---- Meta -->
    {#if track}
      <div class="mt-1 max-w-full overflow-hidden">
        <div
          class="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-lg"
          data-testid={test.playbarTitle}
        >
          {track?.title ?? track?.filepath.split("/").at(-1)}
        </div>
        <div class="flex max-w-full gap-3">
          <div
            class="shrink-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-grey-300"
            data-testid={test.playbarArtist}
          >
            {track?.artist ?? "Unknown"}
          </div>
          <div
            class="shrink-[10000] overflow-hidden text-ellipsis whitespace-nowrap text-sm text-grey-300"
            data-testid={test.playbarAlbum}
          >
            {track?.album ?? ""}
          </div>
        </div>
      </div>
    {/if}
  </div>

  <!---------------------------------->
  <!---- Playback controls          -->
  <!---- Pause / Play / Next buttons-->
  <div class="flex min-w-[20rem] max-w-[62.5rem]  flex-col items-center">
    <div class="mb-1 flex items-center gap-6 text-white ">
      <!---- Backwards button-->
      <button
        on:click={() => player.previous()}
        data-testid={test.playbarBackButton}
        disabled={!$currentTrack}
        class="button rotate-180"
      >
        <IconNext class="h-8 w-8" />
      </button>
      <!---- Play button-->
      {#if $playState === "PLAYING"}
        <button
          on:click={() => player.pause()}
          data-testid={test.playbarPauseButton}
          disabled={!$currentTrack}
          class="button"
        >
          <IconPause class="h-12 w-12" />
        </button>
      {:else}
        <button
          on:click={() => player.resume()}
          data-testid={test.playbarPlayButton}
          disabled={!$currentTrack}
          class="button"
        >
          <IconPlay class="h-12 w-12" />
        </button>
      {/if}
      <!---- Forward button-->
      <button
        on:click={() => player.next()}
        data-testid={test.playbarNextButton}
        disabled={!track}
        class="button"
      >
        <IconNext class="h-8 w-8 " stroke-width="0" />
      </button>
    </div>
  </div>
  <!------///----->

  <!---- Other controls-->
  <div class="flex items-center gap-6 justify-self-end">
    <VolumeControl bind:value={volume} />

    <!--- To be developed and tested
    <button data-testid={test.playbarModeIcon} class="button" disabled={!track}>
      <IconShuffle class="h-6 w-6 sm:h-6" />
    </button>
    <button data-testid={test.playbarLoopIcon} class="button" disabled={!track}>
      <IconRepeat class="h-6 w-6 sm:h-6" />
    </button>
    -->
    <button
      class="button"
      data-testid={test.playbarQueueIcon}
      disabled={!track}
      on:click|stopPropagation={handleClickQueueIcon}
    >
      <IconQueue class="h-6 w-6" />
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
