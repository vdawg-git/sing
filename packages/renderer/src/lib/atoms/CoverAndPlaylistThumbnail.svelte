<script lang="ts">
  import type { FilePath } from "@sing-types/Filesystem"

  export let image: FilePath | readonly FilePath[] | undefined = undefined
  export let isCircle = false
  export let classes: string | undefined = undefined
</script>

<div
  class="h-full w-full overflow-hidden {isCircle
    ? 'rounded-full'
    : 'rounded'} {classes}"
  on:click
>
  {#if image === undefined || image?.length === 0}
    <div
      class="h-full w-full bg-gradient-to-br from-grey-600 to-grey-700
              {isCircle ? 'rounded-full' : 'rounded-lg'}"
    />
  {:else if Array.isArray(image)}
    {#each image as singleImage}
      <img src={singleImage} class="src" />
    {/each}
  {:else if typeof image === "string"}
    <img src={image} class="h-full w-full" />
  {/if}
</div>
