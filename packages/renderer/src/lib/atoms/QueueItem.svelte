<script lang="ts">
  type IState = "PLAYING" | "HAS_PLAYED" | "DEFAULT"

  import type { IQueueItem } from "@/types/Types"
  import { createEventDispatcher } from "svelte"
  import IconClose from "virtual:icons/heroicons-outline/x"
  import { TEST_IDS, TEST_GROUPS } from "@/Consts"
  type ITestIDs =
    | typeof TEST_IDS.queueCurrentTrack
    | typeof TEST_IDS.queuePreviousTrack
    | typeof TEST_IDS.queueNextTrack
    | undefined

  export let queueItemData: IQueueItem
  export let state: IState = "DEFAULT"
  export let testId: ITestIDs = undefined
  export let testgroup: string | undefined = undefined
  export let testQueuePlayedIndex: number | undefined = undefined
  export let testQueueNextIndex: number | undefined = undefined

  // set up test ids
  $: [testTitleID, testArtistID] = (() => {
    switch (testId) {
      case TEST_IDS.queueCurrentTrack:
        return [
          TEST_IDS.queueCurrentTrackTitle,
          TEST_IDS.queueCurrentTrackArtist,
        ]
      case TEST_IDS.queuePreviousTrack:
        return [
          TEST_IDS.queuePreviousTrackTitle,
          TEST_IDS.queuePreviousTrackArtist,
        ]
      case TEST_IDS.queueNextTrack:
        return [TEST_IDS.queueNextTrackTitle, TEST_IDS.queueNextTrackArtist]
      default:
        return [undefined, undefined]
    }
  })()

  $: track = queueItemData.track

  const dispatch = createEventDispatcher()

  function handleRemoveClick() {
    dispatch("remove")
  }
</script>

<main
  class="
    group relative flex w-full cursor-pointer items-center
    justify-between gap-6
  "
  class:opacity-70={state === "HAS_PLAYED"}
  data-trackid={track.id}
  data-testid={testId}
  data-testgroup={testgroup}
  data-testQueueNextIndex={testQueueNextIndex}
  data-testQueuePlayedIndex={testQueuePlayedIndex}
  on:dblclick
>
  <div class="flex grow gap-3">
    {#if track?.coverPath}
      <img
        src={"file://" + track.coverPath}
        alt={track?.title + "cover"}
        class="h-12 w-12 rounded"
        class:opacity-70={state === "HAS_PLAYED"}
      />
    {:else}
      <div class="h-12 w-12 bg-grey-700" />
    {/if}

    <div class="grid grow-0 grid-flow-row items-center">
      <span
        class="overflow-hidden text-ellipsis whitespace-nowrap text-sm"
        data-testid={testTitleID}
      >
        {track?.title ? track.title : "Unknown"}
      </span>
      <span
        class="-mt-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-grey-300"
        data-testid={testArtistID}
      >
        {track?.artist ? track.artist : "Unknown"}
      </span>
    </div>
  </div>
  <div
    class="shrink-0 grow-0"
    data-testgroup={TEST_GROUPS.queueItemDeleteIcon}
    on:click|stopPropagation={handleRemoveClick}
  >
    <IconClose class="mr-2 h-6 w-6 text-grey-300 hover:text-white" />
  </div>
  <div
    class="absolute inset-[-0.5rem] left-[-0.55rem] -z-10 rounded-xl  group-hover:bg-grey-300/10 "
  />
</main>
