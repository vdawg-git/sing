<script lang="ts">
  import { createEventDispatcher } from "svelte"
  import Card from "../molecules/Card.svelte"

  import type { ICardProperties } from "@/types/Types"

  interface IDispatcher_ {
    // Its all the id of the album / artist
    play: string
    clickedPrimary: string
    clickedSecondary: string
  }

  export let items: ICardProperties[]
  export let isImageCircle = false

  const dispatch = createEventDispatcher<IDispatcher_>()

  function dispatchPlay(id: string) {
    dispatch("play", id)
  }

  // TODO Make the secondary work
</script>

<div class="flex w-full flex-wrap gap-6">
  {#each items as item}
    <Card
      data={item}
      {isImageCircle}
      on:play={() => dispatchPlay(item.id)}
      on:clickedPrimary={() => dispatch("clickedPrimary", item.id)}
      on:clickedSecondary={() => dispatch("clickedSecondary", item.id)}
    />
  {/each}

  <div class=" h-24 w-full" />
</div>
