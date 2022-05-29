<script lang="ts">
  import type { ITrack } from "@sing-types/Track"
  import { secondsToDuration } from "@/Helper"
  export let track!: ITrack

  // Not implemented yet
  function formatMeta(text: string): string {
    // TODO: make this work

    // 		const regexp = /\([^\)]*\)/g
    // 		const result = text.replace(regexp, `<span class="text-grey-300">$&</span>`)

    // 		function func(s) {
    //   const regex = /\([^\(\}]+\)/

    //   return s.match(regex)
    // }

    // const tests = [
    //   ["Luv (sic) Part 1", null],
    //   ["Luv (sic) Part 2 (Remix)", "(Remix)"],
    //   ["(Experiment)", null],
    //   ["(Experiment) (Remix)", "(Remix)"],
    // ]

    // tests.forEach(([string, wish]) => {
    //   const test = func(string) === wish
    //   console.assert(test, `\n "${string}" matched ${func(string)} \n Goal: ${wish}`)
    // })

    return text
  }
</script>

<main
  class="
    group relative  z-10  flex w-full cursor-pointer auto-cols-[1fr] items-center
    
  "
  href="#?"
  data-filepath={track.filepath}
  on:click
  on:dblclick
>
  <!---- Cover and Title -->
  <div class="mr-6 min-w-0 flex-1 basis-44 py-2">
    <div class="flex min-w-0 items-center">
      {#if track.coverPath}
        <img
          src="file://{track.coverPath}"
          alt="Cover of {track.title}"
          class="mr-4 h-12 w-12 shrink-0 grow-0 rounded"
        />
      {:else}
        <div
          class="w-12 h-12 mr-4 bg-gradient-to-br from-grey-600 to-grey-700 rounded grow-0 shrink-0"
        />
      {/if}
      <div
        class=" min-w-0  flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
      >
        {@html // @ts-expect-error
        formatMeta(track.title || track.filepath.split("/").at(-1))}
      </div>
    </div>
  </div>

  <!---- Artist -->
  <div
    class="mr-6 flex-1 basis-32  overflow-hidden text-ellipsis whitespace-nowrap align-middle"
  >
    {track.artist}
  </div>

  <!---- Album -->
  <div
    class="mr-6 flex-1 basis-32 overflow-hidden  text-ellipsis whitespace-nowrap align-middle"
  >
    {track.album}
  </div>

  <!---- Duration -->
  <div
    class="flex-1  basis-12 overflow-hidden text-ellipsis whitespace-nowrap text-right align-middle"
  >
    {track?.duration ? secondsToDuration(track.duration) : "ERROR"}
  </div>

  <!---- Hover bg -->
  <div
    class="w-[calc(100% + 2rem)] absolute inset-0 -z-10 -ml-4 -mr-4 h-full  rounded-xl group-hover:bg-grey-700 group-active:bg-grey-600"
  />
</main>

<style lang="postcss">
  /* .contain {
    contain: strict;
  } */
</style>
