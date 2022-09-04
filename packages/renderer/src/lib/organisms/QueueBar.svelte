<script lang="ts" context="module">
  // Save this state across component destruction without an extra store
  let scrollPosition: number = 0
</script>

<script lang="ts">
  import { TEST_ATTRIBUTES, TEST_IDS } from "@/TestConsts"
  import {
    player,
    playedTracks,
    nextTracks,
    currentTrack,
    playIndex,
  } from "@/lib/manager/player/index"
  import QueueItem from "@/lib/atoms/QueueItem.svelte"
  import { fly } from "svelte/transition"
  import { sineInOut } from "svelte/easing"
  import { onMount } from "svelte"

  let scroller: HTMLElement

  $: nextTracksDisplayed = $nextTracks.slice(0, 20)

  onMount(() => {
    // Scroll to last position when rendered again
    const timeout = setTimeout(() => scrollToLastPosition(), 10) // Wait for scroller to get binded and animation finish

    return () => clearTimeout(timeout) // Clears timeout on destroy
  })

  function scrollToLastPosition() {
    scroller.scroll(0, scrollPosition)
  }

  function handleRemove(index: number) {
    player.removeIndexFromQueue(index)
  }
</script>

<main
  data-testid={TEST_IDS.queueBar}
  class="
    custom_ 
    absolute right-6 bottom-0 
    z-10 h-[calc(100vh-5.5rem)]
    w-[25rem] rounded-3xl
    bg-grey-800/90
    backdrop-blur-md
  "
  transition:fly={{
    x: 400,
    duration: 300,
    easing: sineInOut,
    opacity: 100,
  }}
>
  <div
    class="flex h-full max-h-full flex-col overflow-hidden backdrop-blur-none"
  >
    <!---- Title-->
    <div class="shrink-0 grow-0 p-6 px-4 pb-0">Play queue</div>

    <!---- Queue Tracks-->
    <div
      class="
          scrollbar_ 
          mask_ mb-6 mt-0
          flex max-h-full grow flex-col
          gap-6
          overflow-y-auto
          px-4 pr-4 pt-2
        "
      bind:this={scroller}
      on:scroll={() => {
        scrollPosition = scroller.scrollTop
      }}
    >
      <!---- Played Tracks --->
      <!-- Spacer -->
      <div class="h-2" />

      <!-- Played -->
      {#if $playedTracks.length > 0}
        <div
          class="mb-4 flex flex-col gap-4"
          data-testid={TEST_IDS.queueBarPlayedTracks}
        >
          {#each $playedTracks as queueItemData, index (queueItemData.queueID)}
            <QueueItem
              {queueItemData}
              state="HAS_PLAYED"
              testId={index === $playIndex - 1
                ? TEST_IDS.queuePreviousTrack
                : undefined}
              testQueuePlayedIndex={index}
              testattribute={TEST_ATTRIBUTES.queuePreviousTracks}
              on:dblclick={() => player.playQueueIndex(queueItemData.index)}
              on:remove={() => handleRemove(queueItemData.index)}
            />
          {/each}
        </div>
      {/if}

      <!---- Currently playing track --->
      {#if $currentTrack}
        <div class="">
          <div class="mb-3 text-xs font-semibold uppercase text-grey-300">
            Currently playing
          </div>
          <QueueItem
            queueItemData={$currentTrack}
            state="PLAYING"
            testId={TEST_IDS.queueCurrentTrack}
            on:dblclick={() => player.pause()}
            on:remove={() => handleRemove($currentTrack.index)}
          />
        </div>
      {/if}

      <!---- Next Tracks --->
      {#if $nextTracks.length !== 0}
        <div class="mt-4">
          <div class="mb-3 text-xs font-semibold uppercase text-grey-300">
            Next up
          </div>
          <div
            class="flex flex-col gap-4"
            data-testid={TEST_IDS.queueBarNextTracks}
          >
            {#each nextTracksDisplayed as queueItemData, index (queueItemData.queueID)}
              <QueueItem
                {queueItemData}
                testId={index === 0 ? "queueNextTrack" : undefined}
                testQueueNextIndex={index}
                testattribute={TEST_ATTRIBUTES.queueNextTracks}
                on:dblclick={() => player.playQueueIndex(queueItemData.index)}
                on:remove={() => handleRemove(queueItemData.index)}
              />
            {/each}
          </div>
        </div>
      {/if}
      <!---- Spacer element for scrollbar --->
      <div class="min-h-[4.5rem] w-full opacity-0" />
    </div>
  </div>
</main>

<style lang="postcss">
  .scrollbar_ {
    scrollbar-gutter: stable;
  }

  .scrollbar_::-webkit-scrollbar {
    position: absolute;
    width: 0.5rem;
  }

  .scrollbar_::-webkit-scrollbar-track {
    background: transparent;
  }

  .scrollbar_::-webkit-scrollbar-thumb {
    @apply bg-grey-600;
    border-radius: 9999px;
  }

  .custom_ {
    box-shadow: 0px 0px 24px 0px rgba(0, 0, 0, 0.5);
  }

  .mask_ {
    -webkit-mask-image: linear-gradient(
      to bottom,
      transparent 12px,
      black 44px,
      black
    );

    /* background: linear-gradient(to top, black, black 92%, white 97%); */
  }
</style>
