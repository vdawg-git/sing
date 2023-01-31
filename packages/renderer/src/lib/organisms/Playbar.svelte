<script lang="ts">
  import IconLoopSingle from "virtual:icons/custom/repeat-single"
  import IconShuffle from "virtual:icons/eva/shuffle-2-outline"
  import IconLoop from "virtual:icons/heroicons/arrow-path-rounded-square-20-solid"
  import IconNext from "virtual:icons/heroicons/forward"
  import IconPause from "virtual:icons/heroicons/pause-circle-solid"
  import IconPlay from "virtual:icons/heroicons/play-circle-solid"
  import IconQueue from "virtual:icons/heroicons/queue-list"

  import { displayTrackMetadata } from "@/Helper"
  import { TEST_IDS } from "@/TestConsts"
  import {
    loopState,
    setNextLoopState,
    currentTrack,
    playState,
    currentTime,
    seekTo,
    setVolume,
    handleClickedPrevious,
    pausePlayback,
    resumePlayback,
    handleClickedNext,
    shuffleState,
    toggleShuffle,
    toggleMute,
    volume,
    handleSeekingStart,
    handleSeekingEnd,
  } from "@/lib/manager/Player"

  import Seekbar from "@/lib/molecules/Seekbar.svelte"
  import VolumeControl from "@/lib/molecules/VolumeControl.svelte"
  import QueueBar from "@/lib/organisms/QueueBar.svelte"

  let showQueue = false

  function handleClickQueueIcon() {
    showQueue = !showQueue
  }

  function handleSeek({ detail: percentage }: CustomEvent) {
    seekTo(percentage)
  }

  function handleVolumeChange({ target }: Event) {
    setVolume((target as unknown as { value: number }).value as number)
  }
</script>

<section
  class="
    custom_shadow absolute inset-x-0
    bottom-0 z-40 grid h-[72px]
    w-full grid-cols-3 items-center  justify-between  
    rounded-t-xl border
    border-grey-400/50 bg-grey-700/80 px-4 backdrop-blur-xl
  "
  data-testid={TEST_IDS.playbar}
>
  <!--- Seekbar -->
  <div class="absolute top-[2px] flex w-screen justify-center">
    <div class="w-[40%]">
      <Seekbar
        currentTime={$currentTime}
        duration={$currentTrack?.duration}
        on:seek={(event) => handleSeek(event)}
        on:startedSeeking={handleSeekingStart}
        on:endedSeeking={handleSeekingEnd}
      />
    </div>
  </div>

  <!-- Cover and meta data-->
  <div
    class="mr-6 flex max-w-fit shrink grow basis-[20rem] gap-4 overflow-hidden text-ellipsis"
  >
    <!---- Cover -->
    <div class="relative h-14 w-14 shrink-0 bg-grey-600">
      {#if $currentTrack?.cover}
        <img
          class="absolute inset-0 rounded-sm"
          alt={$currentTrack?.title || "Title" + " " + " cover"}
          src={"file://" + $currentTrack?.cover}
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
    {#if $currentTrack}
      <div class="mt-1 max-w-full overflow-hidden">
        <!-- Title -->
        <div
          class="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-lg"
          data-testid={TEST_IDS.playbarTitle}
        >
          {displayTrackMetadata("title", $currentTrack)}
        </div>
        <!-- Artist name -->
        <div class="flex max-w-full gap-3">
          <div
            class="shrink-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs font-medium tracking-wide text-grey-300"
            data-testid={TEST_IDS.playbarArtist}
          >
            {displayTrackMetadata("artist", $currentTrack)}
          </div>
        </div>
      </div>
    {/if}
  </div>

  <!---------------------------------->
  <!----    Playback controls       -->
  <!---------------------------------->
  <div class="flex max-w-[62.5rem]  flex-col items-center">
    <div class="mb-1 flex items-center gap-6 text-white ">
      <!---- Shuffle Button -->
      <button
        data-testid={TEST_IDS.playbarShuffleButton}
        class="button {$shuffleState ? 'button-active' : 'button-inactive'}"
        disabled={!$currentTrack}
        on:click={toggleShuffle}
      >
        <IconShuffle class="h-5 w-5" />
      </button>

      <!---- Backwards button-->
      <button
        on:click={() => handleClickedPrevious()}
        data-testid={TEST_IDS.playbarBackButton}
        disabled={!$currentTrack}
        class="button button-active"
      >
        <div class="rotate-180">
          <IconNext class="h-8 w-8" />
        </div>
      </button>

      <!---- Play button-->
      <button
        on:click={() =>
          $playState === "playing" ? pausePlayback() : resumePlayback()}
        disabled={!$currentTrack}
        class="button button-active"
      >
        {#if $playState === "playing"}
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
        on:click={() => handleClickedNext()}
        data-testid={TEST_IDS.playbarNextButton}
        disabled={!$currentTrack}
        class="button button-active"
      >
        <IconNext class="h-8 w-8 " stroke-width="0" />
      </button>

      <!---- Loop Button -->
      <button
        data-testid={TEST_IDS.playbarLoopIcon}
        class="button {$loopState === 'NONE'
          ? 'button-inactive'
          : 'button-active'}"
        disabled={!$currentTrack}
        on:click={setNextLoopState}
      >
        {#if $loopState === "LOOP_TRACK"}
          <IconLoopSingle class="h-5 w-5" />
        {:else}
          <IconLoop class="h-5 w-5" />
        {/if}
      </button>
    </div>
  </div>

  <!---- Right icons-->
  <div class="flex items-center gap-6 justify-self-end">
    <VolumeControl
      volume={$volume}
      {toggleMute}
      on:change={handleVolumeChange}
    />

    <button
      data-testid={TEST_IDS.playbarQueueIcon}
      class="button button-active"
      on:click|stopPropagation={handleClickQueueIcon}
    >
      <IconQueue class="h-6 w-6" />
    </button>
  </div>
</section>

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
    cursor: pointer;
    transition: color 120ms cubic-bezier(0.4, 0, 0.2, 1),
      transform 120ms cubic-bezier(0.4, 0, 0.2, 1);
    /* @apply transition-transform active:scale-95; */

    &:active {
      transform: scale(0.96, 0.89);
    }

    &:disabled {
      cursor: default;
      color: theme(colors.grey.300);
      @apply active:scale-[1];
    }
  }

  .button-active {
    color: theme(colors.white);

    &:hover {
      color: theme(colors.grey.100);
    }
  }

  .button-inactive {
    color: theme(colors.grey.300);

    &:hover {
      color: theme(colors.grey.400);
    }
  }
</style>
