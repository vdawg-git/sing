<script lang="ts">
  import { createEventDispatcher } from "svelte"
  import { clsx } from "clsx"

  import { secondsToDuration } from "@sing-shared/Pures"

  import { TEST_IDS as test } from "@/TestConsts"

  export let currentTime: number | undefined | null
  export let duration: number | undefined | null

  const dispatch = createEventDispatcher<{
    seek: number
    startedSeeking: never
    endedSeeking: never
  }>()

  // FIXME dragging the seekbar vertically and letting go freezes the seekbar
  // Everything else works as expected

  /**
   * The progress of the track in percentage (0-1)
   */
  let progress = 0

  let isMouseDownForSeeking = false
  let isSeeking = false

  // FIXME its possible to skip to the next track by seeking even when paused (only once though?).
  $: {
    // Prevent the seekbar value from being overwritten by the props while seeking, which prevents seeking.
    if (isSeeking === false) {
      progress = (currentTime ?? 0) / (duration ?? 1)
    }
  }

  $: {
    if (isSeeking === true) {
      console.log("Seeking")
      dispatch("startedSeeking")
    } else {
      dispatch("endedSeeking")
    }
  }

  function handleSeekClick() {
    if (!duration) return

    // Prevent dragging to go to the complete end, thus triggering going to the next track
    // by substracting 0.5s from the current progress
    // Also prevent a negative progress when there is a less than half a second track
    if (progress >= 0.99) progress = Math.max((duration - 0.5) / duration, 0)

    dispatch("seek", progress)
  }
</script>

<main class="group -mt-1.5 cursor-pointer py-3">
  <div
    data-testid={test.seekbar}
    class="relative -mt-2 h-[2px] rounded-full bg-orange-800"
    on:mousedown={() => (isMouseDownForSeeking = true)}
    on:mouseup={() => {
      isSeeking = false
      isMouseDownForSeeking = false
    }}
    on:mousemove={() => {
      if (isMouseDownForSeeking === true) isSeeking = true
    }}
  >
    <!---- Input ---->
    <input
      type="range"
      name="volume slider"
      id="volume_slider"
      min="0"
      max="1"
      step="0.001"
      bind:value={progress}
      class="input_"
      on:input={handleSeekClick}
    />

    <div
      data-testid={test.seekbarProgressbar}
      style="width: {progress * 100}%"
      class={clsx(
        "pointer-events-none relative h-full rounded-full bg-amber-500 ease-in",
        !isSeeking && "transition-[width] duration-[40ms]"
      )}
    >
      <div
        class="
          shadow_small blurred
          pointer-events-none absolute -top-[6px] -right-2 h-3 w-3 rounded-full bg-amber-500  opacity-0 backdrop-blur-3xl delay-100 duration-[150ms] group-hover:opacity-100
        "
      >
        <div
          data-testid={test.seekbarCurrentTime}
          class="pointer-events-none absolute right-0 -bottom-1 -translate-x-6 rounded-md bg-grey-700/50 px-2 text-sm text-grey-100 backdrop-blur-sm"
        >
          {secondsToDuration(currentTime)}
        </div>
      </div>
    </div>
    <div
      data-testid={test.seekbarTotalDuration}
      class="
blurred  pointer-events-none absolute -bottom-2 right-0 translate-x-[calc(100%+12px)]  rounded-md bg-grey-700/50 px-2 text-sm text-grey-100 opacity-0 backdrop-blur-3xl delay-150 duration-[120ms] group-hover:opacity-100
      "
    >
      {secondsToDuration(duration)}
    </div>
  </div>
</main>

<style lang="postcss">
  .blurred {
    -webkit-backdrop-filter: blur(25px);
    backdrop-filter: blur(25px);
  }

  .shadow_small {
    box-shadow: 0px 0px 12px black;
  }

  input[type="range"].input_ {
    position: absolute;
    padding: 0px;
    width: 100%;
    height: 24px;
    background-color: red;
    cursor: pointer;
    top: -12px;
    opacity: 0;

    &:focus {
      outline: none;
    }

    &::-webkit-slider-runnable-track {
      background: theme(colors.grey.500);
    }

    &::-webkit-slider-thumb {
      /* -webkit-appearance: none; */
      width: 24px;
      height: 24px;
      background-color: red;
      opacity: 1;
    }
  }
</style>
