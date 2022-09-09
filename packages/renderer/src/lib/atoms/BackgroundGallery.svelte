<script lang="ts">
  import type { FilePath } from "@sing-types/Filesystem"
  import { match } from "ts-pattern"

  export let backgroundImages: FilePath[] | FilePath

  const maxImages = 100

  $: images =
    typeof backgroundImages === "string"
      ? [backgroundImages]
      : backgroundImages.slice(0, maxImages + 1)

  $: imageSize = match(images)
    .when(
      ({ length }) => length > 80,
      () => "110px"
    )
    .when(
      ({ length }) => length > 70,
      () => "125px"
    )
    .when(
      ({ length }) => length > 50,
      () => "150px"
    )
    .when(
      ({ length }) => length > 40,
      () => "160px"
    )
    .when(
      ({ length }) => length > 20,
      () => "190px"
    )
    .when(
      ({ length }) => length > 10,
      () => "360px"
    )
    .when(
      ({ length }) => length > 5,
      () => "360px"
    )
    .when(
      ({ length }) => length > 0,
      ({ length }) => `${(1 / (length + 1)) * 100}%`
    )
    .when(
      ({ length }) => length === 0,
      () => "0px"
    )
    .run()
</script>

<div class="absolute inset-0 -z-40 h-96 w-screen">
  <div
    class="_contain -z-50 h-[calc(100%-3px)] w-[calc(100vw+370px)] overflow-hidden"
  >
    {#if images.length > 1}
      <div class="flex flex-wrap opacity-70">
        {#each images as image}
          <div
            style="
              background-image: url(file://{image});
              min-width: {imageSize};
              "
            class="aspect-square bg-cover"
          />
        {/each}
      </div>
    {:else}
      <div
        style="background-image: url(file://{images[0]});"
        class="h-full w-full bg-cover blur-md"
      />
    {/if}
  </div>

  <!---- Overlay gradient  -->
  <div class="absolute top-0 h-full w-full bg-gradient-to-t from-grey-900" />
</div>

<style>
  ._grid {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    grid-auto-rows: 100px;
  }

  ._contain {
    contain: content size;
  }
</style>
