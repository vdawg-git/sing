<script lang="ts">
  import IconPause from "virtual:icons/heroicons-outline/pause"
  import IconPlay from "virtual:icons/heroicons-outline/play"
  import IconNext from "virtual:icons/heroicons-outline/fast-forward"
  import IconQueue from "virtual:icons/heroicons-outline/view-list"
  import VolumeControl from "@/lib/molecules/VolumeControl.svelte"
  import { onMount } from "svelte"
  import { displayMetadata } from "@/Helper"

  import QueueBar from "./QueueBar.svelte"
  import Seekbar from "../molecules/Seekbar.svelte"
  import { TEST_IDS } from "@/TestConsts"

  import {
    player,
    currentTrack,
    playState,
    currentTime,
    volume as volumeStore,
  } from "@/lib/manager/player/index"

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
</script>

<main
  class="
    custom_shadow absolute inset-x-0
    bottom-0 z-20 grid h-[72px]
    w-full grid-cols-3 items-center  justify-between  
    rounded-3xl bg-grey-700/80
    px-6 backdrop-blur-xl
  "
  data-testid={TEST_IDS.playbar}
>
  <!--- Seekbar -->
  <div class="absolute top-[2px] flex w-screen justify-center">
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
    <div class="relative h-14 w-14 shrink-0 bg-grey-600">
      {#if track?.cover}
        <img
          class="absolute inset-0 rounded-sm"
          alt={track?.title || "Title" + " " + " cover"}
          src={"file://" + track?.cover}
          data-testid={TEST_IDS.playbarCover}
        />
      {:else}
        <div
          class="absolute inset-0 rounded-sm bg-grey-600"
          data-testid={TEST_IDS.playbarCover}
        />
      {/if}
    </div>

    <!---- Meta -->
    {#if track}
      <div class="mt-1 max-w-full overflow-hidden">
        <div
          class="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-lg"
          data-testid={TEST_IDS.playbarTitle}
        >
          {displayMetadata("title", track)}
        </div>
        <div class="flex max-w-full gap-3">
          <div
            class="shrink-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium text-grey-300"
            data-testid={TEST_IDS.playbarArtist}
          >
            {displayMetadata("artist", track)}
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
        data-testid={TEST_IDS.playbarBackButton}
        disabled={!$currentTrack}
        class="button "
      >
        <div class="rotate-180">
          <IconNext class="h-8 w-8" />
        </div>
      </button>
      <!---- Play button-->
      <button
        on:click={() =>
          $playState === "PLAYING" ? player.pause() : player.resume()}
        disabled={!$currentTrack}
        class="button"
      >
        {#if $playState === "PLAYING"}
          <IconPause
            data-testid={TEST_IDS.playbarPauseButton}
            class="h-12 w-12"
          />
        {:else}
          <IconPlay
            data-testid={TEST_IDS.playbarPlayButton}
            class="h-12 w-12"
          />
        {/if}
      </button>
      <!---- Forward button-->
      <button
        on:click={() => player.next()}
        data-testid={TEST_IDS.playbarNextButton}
        disabled={!track}
        class="button"
      >
        <IconNext class="h-8 w-8 " stroke-width="0" />
      </button>
    </div>
  </div>
  <!------///----->

  <!---- Right icons-->
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
      data-testid={TEST_IDS.playbarQueueIcon}
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
    transition: color 150ms cubic-bezier(0.4, 0, 0.2, 1),
      transform 120ms cubic-bezier(0.4, 0, 0.2, 1);
    /* @apply transition-transform active:scale-95; */

    &:active {
      transform: scale(0.96, 0.89);
    }

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
