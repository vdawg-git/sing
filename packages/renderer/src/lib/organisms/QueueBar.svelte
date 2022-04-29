<script lang="ts">
  import {
    playedTracks,
    nextTracks,
    currentTrack,
    playIndex,
  } from "../manager/PlayerManager"
  import QueueItem from "../atoms/QueueItem.svelte"
  import { fly } from "svelte/transition"
  import { sineInOut } from "svelte/easing"
  import { writable, get } from "svelte/store"
  import { onDestroy } from "svelte"

  export let show: boolean

  const scrollPosition = writable(0)
  let scroller: HTMLElement
  let scrollTimeout: NodeJS.Timeout
  // Scroll to last position when showing again
  $: {
    if (show) {
      scrollTimeout = setTimeout(() => scrollToLastPosition, 10) // Wait for scroller to get binded
    }
  }

  onDestroy(() => clearTimeout(scrollTimeout))

  function scrollToLastPosition() {
    scroller.scroll(0, get(scrollPosition))
  }

  if (show === undefined) throw new Error("Prop `show` is undefined")
</script>

{#if show}
  <main
    class="
      absolute right-0 bottom-0 z-40 flex h-[calc(100vh-2.5rem)] w-[25rem]
      flex-col
      rounded-3xl
      border border-grey-500
      bg-grey-700/60
      backdrop-blur
    "
    transition:fly={{
      x: 400,
      duration: 600,
      easing: sineInOut,
      opacity: 100,
    }}
    data-testid="queueBar"
  >
    <div class=" backdrop-blur-none">
      <div class="shrink-0 grow-0  p-6 pb-0">Play queue</div>

      <div
        class="
          scrollbar 
          my-6 flex flex-col gap-6 
          overflow-y-auto px-6 pr-4
          pt-0
        "
        bind:this={scroller}
        on:scroll={() => scrollPosition.set(scroller.scrollTop)}
      >
        <!---- Played Tracks --->
        {#if $playedTracks}
          <div class="flex flex-col gap-2">
            {#each $playedTracks as { track }, index (index)}
              <QueueItem
                {track}
                state="HAS_PLAYED"
                testid={index === $playIndex - 1
                  ? "queuePreviousTrack"
                  : undefined}
                testQueuePlayedIndex={index}
                testgroup="queueUPreviousTracks"
              />
            {/each}
          </div>
        {/if}

        <!---- Currently playing track --->
        {#if $currentTrack}
          <div class="">
            <div class="mb-2 text-xs font-semibold uppercase text-grey-300">
              Currently playing
            </div>
            <QueueItem
              track={$currentTrack.track}
              state="PLAYING"
              testid="queueCurrentTrack"
            />
          </div>
        {/if}

        <!---- Next Tracks --->
        {#if $nextTracks}
          <div class="">
            <div class="mb-2 text-xs font-semibold uppercase text-grey-300">
              Next up
            </div>
            <div class="flex flex-col gap-2">
              {#each $nextTracks as { track }, index (index)}
                <QueueItem
                  {track}
                  testid={index === 0 ? "queueNextTrack" : undefined}
                  testQueueNextIndex={index}
                  testgroup="queueNextTracks"
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
{/if}

<style>
  /* .scrollbar {
    scrollbar-gutter: stable;
  }

  .scrollbar::-webkit-scrollbar {
    position: absolute;
    width: 0.5rem;
  }

  .scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }

  .scrollbar::-webkit-scrollbar-thumb {
    @apply bg-grey-600;
    border-radius: 9999px;
  } */
</style>
