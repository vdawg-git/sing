<script lang="ts">
  import { useNavigate } from "svelte-navigator"
  import Card from "../molecules/Card.svelte"

  import type { ICardProperties } from "@/types/Types"

  export let items: ICardProperties[]
  export let isImageCircle = false

  const navigate = useNavigate()
</script>

<div class="flex w-full flex-wrap gap-6">
  {#each items as item, index}
    <Card
      data={item}
      {isImageCircle}
      on:clickedPrimary={() => navigate(items[index].title)}
      on:play
    />
  {/each}

  <div class=" h-24 w-full" />
</div>
