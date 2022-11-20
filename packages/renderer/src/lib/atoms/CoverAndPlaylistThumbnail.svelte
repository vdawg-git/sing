<script lang="ts">
  import { match, P } from "ts-pattern"

  import type { FilePath } from "@sing-types/Filesystem"

  export let image: FilePath | readonly FilePath[] | undefined = undefined
  export let isCircle = false
  export let classes: string | undefined = undefined

  // const imagesToDisplay

  let imageToDisplay: readonly FilePath[] | undefined

  $: imageToDisplay = match(image)
    .with(P.array(P.any), (images) => {
      if (images.length === 0) return undefined
      if (images.length >= 4) return images?.slice(0, 4)

      return [images[0]]
    })
    .with(P.string, (singleImage) => [singleImage])
    .with(P.nullish, () => undefined)
    .run()
</script>

<div
  class="h-full w-full overflow-hidden {isCircle
    ? 'rounded-full'
    : 'rounded'} {classes}"
  on:click
  on:contextmenu
>
  {#if imageToDisplay === undefined}
    <div
      class="h-full w-full bg-gradient-to-br from-grey-600 to-grey-700
              {isCircle ? 'rounded-full' : 'rounded-lg'}"
    />
  {:else if imageToDisplay.length === 4}
    <div class="_grid ">
      {#each imageToDisplay as singleImage}
        <img src={`file://${singleImage}`} class="object-cover" />
      {/each}
    </div>
  {:else}
    <img
      src={`file://${imageToDisplay[0]}`}
      class="h-full w-full object-cover"
    />
  {/if}
</div>

<style>
  ._grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
  }
</style>
