<script lang="ts">
  import type { Track as ITrack } from "@prisma/client"
  import { secondsToDuration } from "@/Helper"
  export let track!: ITrack

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
  class="table-row relative group z-10 cursor-pointer"
  href="#?"
  data-filepath={track.filepath}
  on:click
  on:dblclick
>
  <!---- Cover and Title -->
  <div class="tablet align-middle py-2">
    <div class="flex items-center">
      {#if track.coverPath}
        <img
          src="file://{track.coverPath}"
          alt="Cover of {track.title}"
          class="w-12 h-12 mr-4"
        />
      {:else}
        <div class="w-12 h-12 mr-4 bg-grey-500" />
      {/if}
      <div class=" whitespace-nowrap overflow-hidden text-ellipsis">
        {@html formatMeta(track.title || "")}
      </div>
    </div>
  </div>

  <!---- Artist -->
  <div
    class="table-cell align-middle py-1 whitespace-nowrap overflow-hidden text-ellipsis"
  >
    {track.artist}
  </div>

  <!---- Album -->
  <div
    class="table-cell align-middle mr-4 py-2 whitespace-nowrap overflow-ellipsis overflow-hidden"
  >
    {track.album}
  </div>

  <!---- Duration -->
  <div
    class="table-cell text-right align-middle py-2 whitespace-nowrap overflow-hidden text-ellipsis"
  >
    {track?.duration ? secondsToDuration(track.duration) : "ERROR"}
  </div>

  <!---- Hover bg -->
  <div
    class="absolute group-hover:bg-grey-700 h-full w-[calc(100% + 2rem)] inset-0 rounded-xl -z-10  -ml-4 -mr-4 group-active:bg-grey-600"
  />
</main>
