<script lang="ts">
  import { fly } from "svelte/transition"
  import { sineInOut } from "svelte/easing"
  import { onMount } from "svelte"

  import { TEST_ATTRIBUTES, TEST_IDS } from "@/TestConsts"
  import { createAddToPlaylistAndQueueMenuItems } from "@/MenuItemsHelper"
  import {
    playedTracks,
    nextTracks,
    currentTrack,
    playIndex,
    playFromAutoQueue,
    removeIndexFromQueue,
    manualQueue,
    removeIndexFromManualQueue,
    togglePause,
    playFromManualQueue,
  } from "@/lib/manager/player"

  import { playlistsStore } from "../stores/PlaylistsStore"

  import QueueItem from "@/lib/atoms/QueueItem.svelte"

  // TODO when going to the next song multiple times, scroll to the current track

  let scroller: HTMLElement

  $: nextTracksDisplayed = $nextTracks.slice(0, 20)

  $: createContextMenuItems =
    createAddToPlaylistAndQueueMenuItems($playlistsStore)

  let currentTrackElement: HTMLElement | undefined

  onMount(() => {
    // Scroll to current queue item
    scrollToCurrent()
  })

  function scrollToCurrent() {
    // Scroll but leave some top space for the subtitle
    if (currentTrackElement) {
      scroller.scroll(0, currentTrackElement.offsetTop - 84)
    }
  }

  function handleRemoveFromAutoQueue(index: number) {
    removeIndexFromQueue(index)
  }
</script>

<div
  data-testid={TEST_IDS.queueBar}
  class="
    custom_ 
    absolute right-6 bottom-0 
    z-10 h-[calc(100vh-8rem)]
    w-[25rem] rounded-3xl
    border border-grey-400/50 bg-grey-800/90
    backdrop-blur-md
  "
  transition:fly={{
    x: 400,
    duration: 250,
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
          mask_ mb-0 mt-0
          flex max-h-full grow flex-col
          gap-6
          overflow-y-auto
          px-4 pr-4 pt-2
        "
      bind:this={scroller}
    >
      <!-- Spacer -->
      <div class="min-h-[12px] w-1 " />

      <!---- Tracks --->

      <!-- Played -->
      {#if $playedTracks.length > 0}
        <div
          class="mb-4 flex flex-col gap-4"
          data-testid={TEST_IDS.queueBarPlayedTracks}
        >
          {#each $playedTracks as queueItemData, index (queueItemData.queueID)}
            <QueueItem
              track={queueItemData.track}
              state="HAS_PLAYED"
              testId={index === $playIndex - 1
                ? TEST_IDS.queuePreviousTrack
                : undefined}
              testQueuePlayedIndex={index}
              testattributes={[
                TEST_ATTRIBUTES.queuePreviousTracks,
                TEST_ATTRIBUTES.queueItem,
              ]}
              {createContextMenuItems}
              on:play={() => playFromAutoQueue(queueItemData.index)}
              on:remove={async () => removeIndexFromQueue(queueItemData.index)}
            />
          {/each}
        </div>
      {/if}

      <!---- Currently playing track --->
      {#if $currentTrack}
        <div class="" bind:this={currentTrackElement}>
          <div class="mb-3 text-xs font-semibold uppercase text-grey-300">
            Currently playing
          </div>
          <QueueItem
            track={$currentTrack}
            state="PLAYING"
            testId={TEST_IDS.queueCurrentTrack}
            testattributes={TEST_ATTRIBUTES.queueItem}
            {createContextMenuItems}
            on:play={togglePause}
            on:remove={() => handleRemoveFromAutoQueue($playIndex)}
          />
        </div>
      {/if}

      <!-- Manually added queue tracks -->
      {#if $manualQueue.length > 0}
        <div class="mt-4 ">
          <div class="mb-3 text-xs font-semibold uppercase text-grey-300">
            Queue
          </div>
          <div class="flex flex-col gap-4">
            {#each $manualQueue as { track, index, queueID } (queueID)}
              <QueueItem
                {track}
                {createContextMenuItems}
                on:remove={async () => removeIndexFromManualQueue(index)}
                on:play={() => playFromManualQueue(index)}
                testattributes={[
                  TEST_ATTRIBUTES.queueNextTracks,
                  TEST_ATTRIBUTES.queueItem,
                ]}
              />
            {/each}
          </div>
        </div>
      {/if}

      <!-- Next Tracks --->
      {#if $nextTracks.length > 0}
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
                track={queueItemData.track}
                testId={index === 0 ? "queueNextTrack" : undefined}
                testQueueNextIndex={index}
                testattributes={[
                  TEST_ATTRIBUTES.queueNextTracks,
                  TEST_ATTRIBUTES.queueItem,
                ]}
                {createContextMenuItems}
                on:play={() => playFromAutoQueue(queueItemData.index)}
                on:remove={() => handleRemoveFromAutoQueue(queueItemData.index)}
              />
            {/each}
          </div>
        </div>
      {/if}
      <!---- Spacer element for scrollbar --->
      <div class="min-h-playbarPadded w-full" />
    </div>
  </div>
</div>

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
    contain: layout;
  }

  .mask_ {
    -webkit-mask-image: linear-gradient(
      to bottom,
      transparent 12px,
      black 44px,
      black
    );
  }
</style>
