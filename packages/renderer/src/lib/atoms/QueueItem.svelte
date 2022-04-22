<script lang="ts">
  import type { ITrack } from "@sing-types/Track"
  import IconClose from "virtual:icons/heroicons-outline/x"
  // import { setAttributesOnElement } from "../../Helper"

  type IState = "PLAYING" | "HAS_PLAYED" | "DEFAULT"

  export let track: ITrack
  export let state: IState = "DEFAULT"
  export let testid: string | undefined = undefined
  export let testgroup: string | undefined = undefined
  export let testQueuePlayedIndex: number | undefined = undefined
  export let testQueueNextIndex: number | undefined = undefined

  // export let dataAttributes: { name: string; value: string }[]
</script>

<main
  class="
  flex w-full items-center justify-between 
  "
  class:opacity-70={state === "HAS_PLAYED"}
  data-trackid={track.id}
  data-testid={testid}
  data-testgroup={testgroup}
  data-testQueueNextIndex={testQueueNextIndex}
  data-testQueuePlayedIndex={testQueuePlayedIndex}
>
  <div class="flex gap-3">
    {#if track?.coverPath}
      <img
        src={track.coverPath}
        alt={track?.title + "cover"}
        class="h-12 w-12"
        class:opacity-70={state === "HAS_PLAYED"}
      />
    {:else}
      <div class="h-12 w-12 bg-grey-700" />
    {/if}
    <div class="flex flex-col justify-center">
      <div class="text-sm">{track?.title ? track.title : "Unknown"}</div>
      <div class="text-sm text-grey-300">
        {track?.artist ? track.artist : "Unknown"}
      </div>
    </div>
  </div>
  <div>
    <IconClose class="h-6 w-6 text-grey-300" />
  </div>
</main>
