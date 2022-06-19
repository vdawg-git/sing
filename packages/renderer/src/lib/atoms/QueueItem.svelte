<script lang="ts">
  type IState = "PLAYING" | "HAS_PLAYED" | "DEFAULT"

  import type { IQueueItem } from "@/types/Types"
  import { createEventDispatcher } from "svelte"
  import IconClose from "virtual:icons/heroicons-outline/x"
  import { TEST_IDS as testID, testAttr } from "@/TestConsts"
  import { displayMetadata, titleToDisplay } from "@/Helper"
  type ITestIDs =
    | typeof testID.queueCurrentTrack
    | typeof testID.queuePreviousTrack
    | typeof testID.queueNextTrack
    | undefined

  export let queueItemData: IQueueItem
  export let state: IState = "DEFAULT"
  export let testId: ITestIDs = undefined
  export let testattribute: string | undefined = undefined
  export let testQueuePlayedIndex: number | undefined = undefined
  export let testQueueNextIndex: number | undefined = undefined

  // set up test ids
  $: [testTitleID, testArtistID] = (() => {
    switch (testId) {
      case testID.queueCurrentTrack:
        return [testID.queueCurrentTrackTitle, testID.queueCurrentTrackArtist]
      case testID.queuePreviousTrack:
        return [testID.queuePreviousTrackTitle, testID.queuePreviousTrackArtist]
      case testID.queueNextTrack:
        return [testID.queueNextTrackTitle, testID.queueNextTrackArtist]
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
  data-testattribute={testattribute}
  data-testQueueNextIndex={testQueueNextIndex}
  data-testQueuePlayedIndex={testQueuePlayedIndex}
  on:dblclick
>
  <div class="flex grow gap-3">
    {#if track?.coverPath}
      <img
        src={"file://" + track.coverPath}
        alt={displayMetadata("title", track) + " cover"}
        class="h-12 w-12 rounded"
        class:opacity-70={state === "HAS_PLAYED"}
        data-testattribute={testAttr.queueItemCover}
      />
    {:else}
      <div class="h-12 w-12 bg-grey-700" />
    {/if}

    <div class="grid grow-0 grid-flow-row items-center">
      <span
        class="overflow-hidden text-ellipsis whitespace-nowrap text-sm"
        data-testid={testTitleID}
        data-testattribute={testAttr.queueItemTitle}
      >
        {displayMetadata("title", track)}
      </span>
      <span
        class="-mt-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-grey-300"
        data-testid={testArtistID}
        data-testattribute={testAttr.queueItemArtist}
      >
        {displayMetadata("artist", track)}
      </span>
    </div>
  </div>
  <button
    class="shrink-0 grow-0"
    data-testattribute={testAttr.queueItemDeleteIcon}
    on:click|stopPropagation={handleRemoveClick}
  >
    <IconClose class="mr-2 h-6 w-6 text-grey-300 hover:text-white" />
  </button>
  <div
    class="absolute inset-[-0.5rem] left-[-0.55rem] -z-10 rounded-xl  group-hover:bg-grey-300/10 "
  />
</main>
