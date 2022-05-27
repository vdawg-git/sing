<script lang='ts'>
  import {TEST_IDS as test } from "@/Consts"
  import { secondsToDuration } from "@/Helper"

  export let currentTime: number
  export let duration: number
  $: progress = currentTime / duration

</script>

<main>
  <div class="group h-[2px] bg-orange-800" width={progress + "%"} data-test-id="{test.seekbar}">
    <div class="h-full bg-orange-500 relative" data-test-id="{test.seekbarProgressbar}">
      <div class="h-3 w-3 bg-orange-500 absolute right-0 rounded-full scale-0 group-hover:scale-100 ease-in-out duration-150" data-test-id="{test.seekbarProgressbarKnob}">
        <div class="bg-grey-400 absolute bottom-4 px-1">
            {secondsToDuration(currentTime)}
        </div>
      </div>  
    </div>
    <div class="absolute bottom-4 bg-grey-400 px-1">
      {secondsToDuration(duration)}
    </div>
  </div>
</main>