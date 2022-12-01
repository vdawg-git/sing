<script lang="ts">
  import { createEventDispatcher } from "svelte"

  import Card from "../molecules/Card.svelte"

  import type { ICardProperties } from "@/types/Types"


  interface IDispatcher_ {
    // Its all the id of the album / artist
    play: string | number
    clickedPrimary: string | number
    clickedSecondary: string | number
  }

  export let items: ICardProperties[]
  export let isImageCircle = false

  const dispatch = createEventDispatcher<IDispatcher_>()

  function dispatchPlay(id: string | number) {
    dispatch("play", id)
  }

  // TODO Make the secondary work
</script>

<div class="flex h-full w-full flex-wrap gap-6 overflow-y-scroll">
  {#each items as data}
    <Card
      {data}
      {isImageCircle}
      on:play={() => dispatchPlay(data.id)}
      on:clickedPrimary={() => dispatch("clickedPrimary", data.id)}
      on:clickedSecondary={() => dispatch("clickedSecondary", data.id)}
    />
  {/each}

  <div class=" h-24 w-full" />
</div>
