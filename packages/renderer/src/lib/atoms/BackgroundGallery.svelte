<script lang="ts">
  import { fade } from "svelte/transition"
  import { match, P } from "ts-pattern"

  import type { FilePath } from "@sing-types/Filesystem"

  export let images: readonly FilePath[] | FilePath | undefined

  const maxImages = 50

  let element: HTMLElement | undefined

  // TODO Fix images not taking up available space when adding / removing tracks from a playlist and/or resizing the window

  $: displayedImages = match(images)
    .with(P.nullish, () => [])
    .with(P.string, (image) => [image])
    .with(P.array(P.any), (imagesToDisplay) =>
      imagesToDisplay.slice(0, maxImages + 1)
    )
    .run()

  $: imageSize = match(displayedImages)
    .when(
      ({ length }) => length === 0,
      () => "0px"
    )
    .when(
      ({ length }) => length > 80,
      () => (isScreenUltrawide() ? "160px" : "110px")
    )
    .when(
      ({ length }) => length > 70,
      () => (isScreenUltrawide() ? "180px" : "125px")
    )
    .when(
      ({ length }) => length > 50,
      () => (isScreenUltrawide() ? "210px" : "150px")
    )
    .when(
      ({ length }) => length > 40,
      () => (isScreenUltrawide() ? "230px" : "160px")
    )
    .when(
      ({ length }) => length > 20,
      () => (isScreenUltrawide() ? "270px" : "190px")
    )
    .when(
      ({ length }) => length > 10,
      () => (isScreenUltrawide() ? "410px" : "360px")
    )
    .when(
      ({ length }) => length > 5,
      () => (isScreenUltrawide() ? "410px" : "350px")
    )

    .when(
      ({ length }) => length > 0,
      ({ length }) => `${(1 / (length + 1)) * 100}%`
    )
    .run()

  // $: offsetLeft = element
  //   ? element.getBoundingClientRect().left + scrollbarWidth
  //   : 0

  function isScreenUltrawide() {
    return document.body.getBoundingClientRect().width > 2400
  }
</script>

{#key displayedImages}
  <div
    class="absolute inset-0 -top-6 -z-40 h-96 w-screen overflow-hidden bg-grey-400 [contain:strict]"
    bind:this={element}
    transition:fade={{ duration: 250 }}
  >
    <div
      class="relative -z-50 -ml-16 h-[calc(100%-3px)] overflow-y-hidden"
      style="width: calc(100vw + 730px);"
    >
      {#if displayedImages.length > 1}
        <div class="absolute inset-0 flex h-full w-full flex-wrap opacity-50">
          {#each displayedImages as image}
            <div
              data-x={image}
              style="
                background-image: url('file://{image}');
                min-width: {imageSize};
                "
              class="aspect-square bg-cover"
            />
          {/each}
        </div>
      {:else}
        <div
          style="background-image: url('file://{displayedImages[0]}');"
          class="absolute inset-0 h-full w-full bg-repeat opacity-40"
        />
      {/if}
    </div>

    <!---- Overlay gradient  -->
    <div
      class="absolute top-0 h-full w-full bg-gradient-to-t from-grey-900 to-grey-900/20"
    />
  </div>
{/key}
