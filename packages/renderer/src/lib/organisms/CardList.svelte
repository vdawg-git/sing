<script lang="ts">
  import Card from "../molecules/Card.svelte"

  import type { ICardProperties } from "@/types/Types"
  import type { ITestAttribute, ITestID } from "@/TestConsts"

  export let items: readonly ICardProperties[]
  export let isImageCircle = false
  export let testID: ITestID
  export let cardTestAttributes: ITestAttribute | readonly ITestAttribute[]

  // TODO Make the secondary work
</script>

<div
  class="flex h-full w-full flex-wrap gap-6 overflow-y-scroll"
  data-testid={testID}
>
  {#each items as data}
    <Card
      {data}
      {isImageCircle}
      on:play={data.onPlay}
      on:clickedPrimary={data.onClickPrimary}
      on:clickedSecondary={data.onClickSecondary}
      testAttributes={cardTestAttributes}
    />
  {/each}

  <div class=" h-24 w-full" />
</div>
