<script lang="ts">
  type IState = "PLAYING" | "HAS_PLAYED" | "DEFAULT"

  import { createEventDispatcher } from "svelte"
  import IconClose from "virtual:icons/heroicons/x-mark-20-solid"

  import { TEST_IDS, TEST_ATTRIBUTES } from "@/TestConsts"
  import { displayTrackMetadata } from "@/Helper"

  import { useOpenContextMenu } from "../manager/menu"

  import type { ICreateMenuOutOfMusic } from "@/types/Types"
  import type { ITrack } from "@sing-types/DatabaseTypes"

  type ITestIDs =
    | typeof TEST_IDS.queueCurrentTrack
    | typeof TEST_IDS.queuePreviousTrack
    | typeof TEST_IDS.queueNextTrack
    | undefined

  export let track: ITrack
  export let state: IState = "DEFAULT"
  export let testId: ITestIDs = undefined
  export let testattribute: string | undefined = undefined
  export let testQueuePlayedIndex: number | undefined = undefined
  export let testQueueNextIndex: number | undefined = undefined
  export let createContextMenuItems: ICreateMenuOutOfMusic

  // set up test ids for the artist and title meta based on the item index positon
  $: [testTitleID, testArtistID] = (() => {
    switch (testId) {
      case TEST_IDS.queueCurrentTrack: {
        return [
          TEST_IDS.queueCurrentTrackTitle,
          TEST_IDS.queueCurrentTrackArtist,
        ]
      }
      case TEST_IDS.queuePreviousTrack: {
        return [
          TEST_IDS.queuePreviousTrackTitle,
          TEST_IDS.queuePreviousTrackArtist,
        ]
      }
      case TEST_IDS.queueNextTrack: {
        return [TEST_IDS.queueNextTrackTitle, TEST_IDS.queueNextTrackArtist]
      }
      default: {
        return [undefined, undefined]
      }
    }
  })()

  $: contextMenuItems = createContextMenuItems({
    type: "track",
    name: displayTrackMetadata("title", track),
    id: track.id,
  })

  const dispatch = createEventDispatcher<{ play: never; remove: never }>()

  function handleRemoveClick() {
    dispatch("remove")
  }

  function dispatchPlay() {
    dispatch("play")
  }
</script>

<button
  class="
    group relative flex w-full cursor-pointer items-center
    justify-between gap-6 text-left
  "
  class:opacity-70={state === "HAS_PLAYED"}
  data-trackid={track.id}
  data-testid={testId}
  data-testattribute={testattribute}
  data-testQueueNextIndex={testQueueNextIndex}
  data-testQueuePlayedIndex={testQueuePlayedIndex}
  on:dblclick={dispatchPlay}
  on:keypress={(event) => {
    if (event.key !== "Enter") return

    dispatchPlay()
  }}
  use:useOpenContextMenu={{ menuItems: contextMenuItems }}
>
  <div class="flex grow gap-3">
    <!---- Cover  -->
    {#if track?.cover}
      <img
        src={"file://" + track.cover}
        alt={displayTrackMetadata("title", track) + " cover"}
        class="h-12 w-12 rounded"
        class:opacity-70={state === "HAS_PLAYED"}
        data-testattribute={TEST_ATTRIBUTES.queueItemCover}
      />
    {:else}
      <div class="h-12 w-12 shrink-0 rounded bg-grey-700" />
    {/if}

    <!---- Meta -->
    <div class="grid grow-0 grid-flow-row items-center">
      <span
        class="overflow-hidden text-ellipsis whitespace-nowrap text-base"
        data-testid={testTitleID}
        data-testattribute={TEST_ATTRIBUTES.queueItemTitle}
      >
        {displayTrackMetadata("title", track)}
      </span>
      <span
        class="-mt-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium text-grey-300"
        data-testid={testArtistID}
        data-testattribute={TEST_ATTRIBUTES.queueItemArtist}
      >
        {displayTrackMetadata("artist", track)}
      </span>
    </div>
  </div>

  <!---- Remove button -->
  <button
    class="shrink-0 grow-0"
    data-testattribute={TEST_ATTRIBUTES.queueItemDeleteIcon}
    on:click|stopPropagation={handleRemoveClick}
  >
    <IconClose class="mr-2 h-6 w-6 text-grey-300 hover:text-white" />
  </button>
  <div
    class="absolute inset-[-0.5rem] left-[-0.55rem] -z-10 rounded-xl  group-hover:bg-grey-300/10 "
  />
</button>
