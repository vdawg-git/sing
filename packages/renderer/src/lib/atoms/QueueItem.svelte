<script lang="ts">
  import type { Track as ITrack } from "@prisma/client"
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
  flex justify-between items-center w-full 
  "
  class:opacity-70={state === "HAS_PLAYED"}
  data-trackid={track.id}
  data-testid={testid}
  data-testgroup={testgroup}
  data-testQueueNextIndex={testQueueNextIndex}
  data-testQueuePlayedIndex={testQueuePlayedIndex}
>
  <div class="flex gap-3">
    <img src={track.coverPath} alt={track.title + "cover"} class="h-12 w-12" />
    <div class="flex flex-col justify-center">
      <div class="text-sm">{track.title}</div>
      <div class="text-grey-300 text-sm">{track.artist}</div>
    </div>
  </div>
  <IconClose class="w-6 h-6 text-grey-300" />
</main>
